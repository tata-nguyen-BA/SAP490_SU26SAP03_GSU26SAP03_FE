sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageToast",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "sap/m/Label",
        "sap/m/Text",
        "sap/ui/table/Column",
        "./helper/ExcelTemplate",
        "./helper/ExcelParser",
        "./helper/ApiService",
        "./helper/ResultsDialog",
        "./helper/ErrorDialog",
        "./helper/ColumnConfig",
        "./helper/ColumnSettingsDialog",
        "./xlsx/xlsx.bundle",
    ],
    function (
        Controller,
        MessageToast,
        JSONModel,
        MessageBox,
        Label,
        Text,
        Column,
        ExcelTemplate,
        ExcelParser,
        ApiService,
        ResultsDialog,
        ErrorDialog,
        ColumnConfig,
        ColumnSettingsDialog
    ) {
        "use strict";

        const UPLOAD_TABLE_MODEL = "uploadModel";
        const UPLOAD_TABLE_ID = "tableUpload";
        const POST_BTN_ID = "postButton";
        const CHECK_BTN_ID = "checkButton";

        return Controller.extend("zfipkzup.controller.Fi", {
            dataUpload: [],

            onInit() {
                this.getView().setModel(new JSONModel({ items: [] }), UPLOAD_TABLE_MODEL);
                this._buildColumns();
            },

            onExit() {
                this._destroyBusy();
                ColumnSettingsDialog.destroy(this);
            },

            _getODataModel() {
                return this.getView().getModel();
            },

            // ── Dynamic Columns (88 cột từ ColumnConfig) ──

            /**
             * Sinh 88 cột từ ColumnConfig vào tableUpload.
             * Visible khởi tạo: lựa chọn đã lưu localStorage, không có thì default 13 cột.
             */
            _buildColumns() {
                const oTable = this.byId(UPLOAD_TABLE_ID);
                const aVisibleKeys = ColumnSettingsDialog.getInitialVisibleKeys();

                ColumnConfig.getColumns().forEach((c) => {
                    const oColumn = new Column(this.createId("col_" + c.key), {
                        width: c.width || "10rem",
                        visible: aVisibleKeys.indexOf(c.key) !== -1,
                        label: new Label({ text: c.label, wrapping: false }),
                        template: new Text({
                            text: "{" + UPLOAD_TABLE_MODEL + ">" + c.key + "}",
                            wrapping: false,
                        }),
                    });
                    // Gắn key để dialog đọc lại trạng thái hiện tại của bảng
                    oColumn.data("colKey", c.key);
                    oTable.addColumn(oColumn);
                });
            },

            /** Áp visibility theo danh sách key được chọn */
            _applyColumnVisibility(aVisibleKeys) {
                const oTable = this.byId(UPLOAD_TABLE_ID);
                oTable.getColumns().forEach((oCol) => {
                    const sKey = oCol.data("colKey");
                    oCol.setVisible(aVisibleKeys.indexOf(sKey) !== -1);
                });
            },

            /** Nút All Field: hiện đủ 88 cột */
            onShowAllColumns() {
                const aAll = ColumnConfig.getAllKeys();
                this._applyColumnVisibility(aAll);
                ColumnSettingsDialog.saveVisibleKeys(aAll);
                MessageToast.show("Đang hiển thị tất cả 88 field");
            },

            /** Nút Setting: mở dialog chọn cột */
            openSetting() {
                ColumnSettingsDialog.open(this, (aSelectedKeys) => {
                    this._applyColumnVisibility(aSelectedKeys);
                    MessageToast.show("Đã áp dụng " + aSelectedKeys.length + " cột");
                });
            },

            // ── Navigation ──

            onNavBack() {
                this.getOwnerComponent().getRouter().navTo("RouteMain");
            },

            // ── Template ──

            onDownloadTemplate() {
                ExcelTemplate.download();
                MessageToast.show("Template File Downloading...");
            },

            // ── Upload ──

            onFileChange: async function (oEvent) {
                const oFile = oEvent.getParameter("files")[0];
                const oModel = this.getView().getModel(UPLOAD_TABLE_MODEL);

                if (!oFile) {
                    this._refreshTable();
                    return;
                }

                this.dataUpload = [];
                oModel.setProperty("/items", []);
                this._showBusy();

                try {
                    await ApiService.checkFileExists(this._getODataModel(), oFile.name);

                    const fileContent = await ExcelParser.readFile(oFile);
                    const workbook = XLSX.read(fileContent, { type: "binary" });
                    const excelData = XLSX.utils.sheet_to_row_object_array(
                        workbook.Sheets["Data"]
                    );

                    if (excelData.length <= 1) {
                        MessageToast.show("Lỗi định dạng dữ liệu hoặc file rỗng!");
                        this._refreshTable();
                        return;
                    }

                    const result = ExcelParser.processExcelData(excelData);

                    if (result.errors.length > 0) {
                        this.byId(POST_BTN_ID).setEnabled(false);
                        this.byId(CHECK_BTN_ID).setEnabled(false);
                        ErrorDialog.handleErrorDialog(result.errors, this);
                    } else {
                        this.dataUpload = result.data;
                        oModel.setProperty("/items", this.dataUpload);
                        MessageToast.show("Upload Successful");
                        this.byId(POST_BTN_ID).setEnabled(true);
                        this.byId(CHECK_BTN_ID).setEnabled(true);
                    }
                } catch (error) {
                    if (error?.message) {
                        MessageBox.error(error.message);
                    } else {
                        MessageToast.show("Upload failed or was cancelled.");
                    }
                    this.byId(POST_BTN_ID).setEnabled(false);
                    this.byId(CHECK_BTN_ID).setEnabled(false);
                } finally {
                    this._closeBusy();
                }
            },

            onCheck(oEvent) {
                ApiService.checkFileExists(this._getODataModel(), this.getCurrentFileName())
                    .then(() => this.callApiFiDoc(oEvent, "X"))
                    .catch((error) => MessageBox.error(error.message));
            },

            onPost: async function (oEvent) {
                try {
                    await ApiService.checkFileExists(this._getODataModel(), this.getCurrentFileName());
                    this.callApiFiDoc(oEvent, "");
                } catch (error) {
                    MessageBox.error(error.message);
                }
            },

            callApiFiDoc: async function (oEvent, sTestMode) {
                this._showBusy();
                try {
                    const oModel = this._getODataModel();
                    const groupedDocs = ApiService.groupDataByDocId(this.dataUpload);
                    const aDocs = ApiService.buildAllDocs(groupedDocs);
                    const isUpdate = this.isDocumentPosted ? "X" : "";

                    const oResponse = await ApiService.callActionUpload(
                        oModel,
                        this.getCurrentFileName(),
                        isUpdate,
                        sTestMode,
                        aDocs
                    );

                    ResultsDialog.show(this, oResponse.messages, sTestMode, POST_BTN_ID);
                } catch (error) {
                    MessageBox.error(error.message || JSON.stringify(error));
                } finally {
                    this._closeBusy();
                }
            },

            getCurrentFileName() {
                return this.byId("fileUploader").getValue() || null;
            },

            /** Nút Clear: xóa sạch dữ liệu upload, reset trạng thái nút */
            onClearUpload() {
                this._refreshTable();
                this.isDocumentPosted = false;
                MessageToast.show("Đã xóa dữ liệu upload");
            },

            // ── History ──
            onRefreshHistory() {
                const oTable = this.byId("historyTable");
                const oBinding = oTable && oTable.getBinding("items");
                if (oBinding) oBinding.refresh();
            },
            onHistoryItemPress() {},

            // ── UI Utilities ──
            _showBusy() {
                const oBusy = this.byId("idBusyDialog");
                if (oBusy) oBusy.open();
            },
            _closeBusy() {
                const oBusy = this.byId("idBusyDialog");
                if (oBusy) oBusy.close();
            },
            _destroyBusy() {
                const oBusy = this.byId("idBusyDialog");
                if (oBusy) { oBusy.close(); oBusy.destroy(); }
            },
            _refreshTable() {
                const oModel = this.getView().getModel(UPLOAD_TABLE_MODEL);
                this.dataUpload = [];
                oModel.setProperty("/items", []);
                this.byId(POST_BTN_ID).setEnabled(false);
                this.byId(CHECK_BTN_ID).setEnabled(false);
                this.byId("fileUploader")?.clear();
            },
        });
    }
);