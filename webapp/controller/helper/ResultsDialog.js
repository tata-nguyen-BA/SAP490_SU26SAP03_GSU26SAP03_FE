sap.ui.define(
    [
        "sap/m/MessageItem",
        "sap/m/MessageView",
        "sap/m/Dialog",
        "sap/m/Button",
        "sap/m/Bar",
        "sap/m/Title",
        "sap/ui/core/IconPool",
        "sap/ui/core/library",
        "sap/ui/model/json/JSONModel",
    ],
    function (MessageItem, MessageView, Dialog, Button, Bar, Title, IconPool, coreLibrary, JSONModel) {
        "use strict";
        const TitleLevel = coreLibrary.TitleLevel;
        let oMsgView = null;
        let oDialog = null;
        function _createDialog() {
            const oBackButton = new Button({
                icon: IconPool.getIconURI("nav-back"),
                visible: false,
                press: () => {
                    oMsgView.navigateBack();
                    oBackButton.setVisible(false);
                },
            });
            oMsgView = new MessageView({
                showDetailsPageHeader: false,
                itemSelect: () => oBackButton.setVisible(true),
                items: {
                    path: "/",
                    template: new MessageItem({
                        type: "{type}",
                        title: "{title}",
                        groupName: "{group}",
                    }),
                },
                groupItems: true,
            });
            oDialog = new Dialog({
                resizable: true,
                content: oMsgView,
                state: "Information",
                beginButton: new Button({
                    text: "Close",
                    press: () => oDialog.close(),
                }),
                customHeader: new Bar({
                    contentLeft: [oBackButton],
                    contentMiddle: [new Title({ text: "Messages", level: TitleLevel.H1 })],
                }),
                contentHeight: "50%",
                contentWidth: "50%",
                verticalScrolling: false,
            });
        }
        return {
            show: function (oController, allMessages, sTestMode, sPostBtnId) {
                if (!oDialog) _createDialog();
                const bHasErrors = allMessages.some((msg) => msg.type === "Error");
                const oMsgModel = new JSONModel();
                oMsgModel.setData(allMessages);
                oMsgModel.setSizeLimit(allMessages.length);
                oMsgView.setModel(oMsgModel);
                oMsgView.navigateBack();
                oDialog.open();
                const oPostButton = oController.byId(sPostBtnId);
                if (oPostButton) {
                    if (bHasErrors) {
                        oPostButton.setEnabled(false);
                    } else if (sTestMode !== "X") {
                        oPostButton.setEnabled(false);
                    } else {
                        oPostButton.setEnabled(true);
                    }
                }
            },
        };
    }
);