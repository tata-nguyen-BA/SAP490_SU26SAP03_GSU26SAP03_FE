sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageToast",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "./helper/ExcelParser",
        "./helper/ApiService",
        "./xlsx/xlsx.bundle",
    ],
    function (Controller, MessageToast, JSONModel, MessageBox,
              ExcelParser, ApiService) {
        "use strict";

        const UPLOAD_MODEL = "grModel";
        const POST_BTN_ID  = "grPostButton";
        const CHECK_BTN_ID = "grCheckButton";

        return Controller.extend("zfipkzup.controller.Gr", {
            dataUpload: [],

            onInit() {
                this.getView().setModel(new JSONModel({ items: [] }), UPLOAD_MODEL);
                this.getView().setModel(new JSONModel({}), "grResult");
            },

            onExit() {
                this._destroyBusy();
            },

            _getGrModel() {
                return this.getView().getModel("gr"); // OData V4 model gr
            },

            onNavBack() {
                this.getOwnerComponent().getRouter().navTo("RouteMain");
            },

            onDownloadTemplate() {
                // Tạo template đơn giản — xem GrExcelTemplate.js nếu có
                MessageToast.show("Tải template GR...");
                // TODO: tạo helper/GrExcelTemplate.js tương tự PpExcelTemplate.js
            },

            // ── Upload / Parse ──

            onFileChange: async function (oEvent) {
                const oFile = oEvent.getParameter("files")?.[0];
                const oModel = this.getView().getModel(UPLOAD_MODEL);

                if (!oFile) { this._refreshTable(); return; }

                this.dataUpload = [];
                oModel.setProperty("/items", []);
                this._showBusy();

                try {
                    const fileContent = await ExcelParser.readFile(oFile);
                    const workbook = XLSX.read(fileContent, { type: "binary" });
                    const oSheet = workbook.Sheets["Data"] ||
                        workbook.Sheets[workbook.SheetNames[0]];
                    const excelData = XLSX.utils.sheet_to_row_object_array(oSheet, {
                        defval: ""
                    });

                    if (!excelData || excelData.length <= 1) {
                        MessageToast.show("File rỗng hoặc thiếu dữ liệu!");
                        this._refreshTable();
                        return;
                    }

                    // Dòng 0 là header label template — bỏ qua
                    delete excelData[0];

                    const result = this._processRows(excelData);
                    this.dataUpload = result.data;
                    oModel.setProperty("/items", this.dataUpload);

                    if (this.dataUpload.length === 0) {
                        MessageToast.show("Không có dòng dữ liệu hợp lệ!");
                        this.byId(POST_BTN_ID).setEnabled(false);
                        this.byId(CHECK_BTN_ID).setEnabled(false);
                        return;
                    }

                    MessageToast.show("Đọc thành công " + this.dataUpload.length + " dòng");
                    this.byId(POST_BTN_ID).setEnabled(true);
                    this.byId(CHECK_BTN_ID).setEnabled(true);

                } catch (err) {
                    MessageBox.error(err?.message || "Lỗi đọc file.");
                    this.byId(POST_BTN_ID).setEnabled(false);
                    this.byId(CHECK_BTN_ID).setEnabled(false);
                } finally {
                    this._closeBusy();
                }
            },

            _processRows(excelData) {
                const aData = [];
                const _key = (row, k) => String(row[k] || row[k.toUpperCase()] || "").trim();

                excelData.forEach((raw) => {
                    if (!raw) return;
                    // Bỏ dòng trống (không có PO_NUMBER và GR_NUMBER)
                    if (!_key(raw, "po_number") && !_key(raw, "gr_number")) return;

                    aData.push({
                        gr_number:       _key(raw, "gr_number"),
                        document_date:   this._convDate(_key(raw, "document_date")),
                        movement_type:   _key(raw, "movement_type") || "101",
                        po_number:       _key(raw, "po_number"),
                        po_item:         _key(raw, "po_item"),
                        receive_qty:     _key(raw, "receive_qty"),
                        unit:            _key(raw, "unit"),
                        storage_location: _key(raw, "storage_location"),
                    });
                });

                return { data: aData };
            },

            /** DD/MM/YYYY → YYYYMMDD */
            _convDate(v) {
                if (!v || v.length !== 10) return v;
                return `${v.substring(6)}${v.substring(3, 5)}${v.substring(0, 2)}`;
            },

            // ── Check / Post ──

            onCheck() {
                this._callUpload(true);
            },

            onPost() {
                this._callUpload(false);
            },

            _callUpload: async function (bTestMode) {
                this._showBusy();
                try {
                    const aDocs = ApiService.buildGrDocs(this.dataUpload);
                    const oResult = await ApiService.callActionUploadGR(
                        this._getGrModel(),
                        this.getCurrentFileName(),
                        bTestMode,
                        aDocs
                    );

                    // Result [1] summary — hiển thị Panel
                    const oResultModel = this.getView().getModel("grResult");
                    oResultModel.setData({
                        ...oResult,
                        statusText: oResult.status === "S" ? "Thành công" :
                                    oResult.status === "E" ? "Lỗi"        : "Đang xử lý",
                        statusState: oResult.status === "S" ? "Success" :
                                     oResult.status === "E" ? "Error"   : "Warning",
                    });
                    this.byId("grResultPanel").setVisible(true);

                    if (bTestMode) {
                        MessageToast.show("Check xong — xem kết quả ở trên");
                    } else {
                        MessageToast.show(
                            "Đã gửi " + (oResult.total_count || 0) +
                            " GR. Xem tab Lịch sử để theo dõi trạng thái."
                        );
                        this.onRefreshHistory();
                    }
                } catch (err) {
                    MessageBox.error(err?.message || JSON.stringify(err));
                } finally {
                    this._closeBusy();
                }
            },

            getCurrentFileName() {
                return this.byId("grFileUploader").getValue() || "";
            },

            onClearUpload() {
                this._refreshTable();
                this.byId("grResultPanel").setVisible(false);
                MessageToast.show("Đã xóa dữ liệu");
            },

            onRefreshHistory() {
                const oTable = this.byId("grHistoryTable");
                const oBinding = oTable?.getBinding("items");
                if (oBinding) oBinding.refresh();
            },

            // ── UI Utilities ──
            _showBusy() { this.byId("idBusyDialog")?.open(); },
            _closeBusy() { this.byId("idBusyDialog")?.close(); },
            _destroyBusy() {
                const o = this.byId("idBusyDialog");
                if (o) { o.close(); o.destroy(); }
            },
            _refreshTable() {
                this.getView().getModel(UPLOAD_MODEL).setProperty("/items", []);
                this.dataUpload = [];
                this.byId(POST_BTN_ID).setEnabled(false);
                this.byId(CHECK_BTN_ID).setEnabled(false);
                this.byId("grFileUploader")?.clear();
            },
        });
    }
);
