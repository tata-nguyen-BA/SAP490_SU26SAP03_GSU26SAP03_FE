sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("zfipkzup.controller.Main", {
            onInit() {
                // Model thống kê
                this.getView().setModel(
                    new JSONModel({ total: 0, lastFile: "—", lastDate: "—" }),
                    "stat"
                );
                this._loadStats();

                // Cập nhật lại stats mỗi khi quay về màn Main
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteMain").attachPatternMatched(this._loadStats, this);
            },

            _loadStats() {
                const oModel = this.getView().getModel(); // V4 default
                if (!oModel) return;
                const oStat = this.getView().getModel("stat");

                const oListBinding = oModel.bindList("/UploadHistory", null, [], [], {
                    $orderby: "pst_date desc",
                });
                oListBinding
                    .requestContexts(0, 100)
                    .then((aContexts) => {
                        oStat.setProperty("/total", aContexts.length);
                        if (aContexts.length > 0) {
                            const oFirst = aContexts[0].getObject();
                            oStat.setProperty("/lastFile", oFirst.filename || "—");
                            const sDate = oFirst.pst_date;
                            oStat.setProperty(
                                "/lastDate",
                                sDate ? this._fmtDate(sDate) : "—"
                            );
                        } else {
                            oStat.setProperty("/lastFile", "Chưa có");
                            oStat.setProperty("/lastDate", "—");
                        }
                    })
                    .catch(() => {
                        // im lặng nếu lỗi đọc lịch sử - không chặn wrapper
                    });
            },

            _fmtDate(sDate) {
                if (typeof sDate === "string" && sDate.length >= 10) {
                    return sDate.substring(8, 10) + "/" + sDate.substring(5, 7);
                }
                return String(sDate);
            },

            onPressFI() {
                this.getOwnerComponent().getRouter().navTo("RouteFi");
            },

            onPressPP() {
                this.getOwnerComponent().getRouter().navTo("RoutePp");
            },
            
            onPressGR() {
                this.getOwnerComponent().getRouter().navTo("RouteGr");
            },

        });
    }
);