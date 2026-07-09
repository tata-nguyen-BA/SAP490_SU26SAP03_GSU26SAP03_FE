sap.ui.define(
    [
        "sap/m/p13n/Engine",
        "sap/m/p13n/MetadataHelper",
        "sap/m/p13n/SelectionController",
        "sap/m/p13n/SortController",
        "sap/m/p13n/GroupController",
        "sap/m/MessageToast",
    ],
    function (Engine, MetadataHelper, SelectionController, SortController, GroupController, MessageToast) {
        "use strict";

        const COLUMN_METADATA = [
            { key: "id_doc", label: "ID Doc", path: "id_doc" },
            { key: "accountingdocument", label: "Accounting Document", path: "accountingdocument" },
            { key: "documentdate", label: "Document Date", path: "documentdate" },
            { key: "postingdate", label: "Posting Date", path: "postingdate" },
            { key: "documenttype", label: "Document Type", path: "documenttype" },
            { key: "companycode", label: "Company Code", path: "companycode" },
            { key: "currency", label: "Currency", path: "currency" },
            { key: "exchangerate", label: "Exchange Rate", path: "exchangerate" },
            { key: "headertext", label: "Header Text", path: "headertext" },
            { key: "referencedoc", label: "Reference Document", path: "referencedoc" },
            { key: "headerref1", label: "Header Reference 1", path: "headerref1" },
            { key: "negativeposting", label: "Is Negative Posting", path: "negativeposting" },
            { key: "postingkey", label: "Posting Key", path: "postingkey" },
            { key: "account", label: "Account", path: "account" },
            { key: "mainassetnumber", label: "Main Asset Number", path: "mainassetnumber" },
            { key: "subassetnumber", label: "Sub Asset Number", path: "subassetnumber" },
            { key: "specialglaccount", label: "Special GL Account", path: "specialglaccount" },
            { key: "assettransactiontype", label: "Asset TrnsType", path: "assettransactiontype" },
            { key: "amountindoumentcurrency", label: "Amount in Doc Cur", path: "amountindoumentcurrency" },
            { key: "amountinlocalcurrency", label: "Amount in Local Cur", path: "amountinlocalcurrency" },
            { key: "taxbaseamount", label: "Tax Base Amt", path: "taxbaseamount" },
            { key: "localtaxbaseamount", label: "Local Tax Base Amt", path: "localtaxbaseamount" },
            { key: "assignment", label: "Assignment", path: "assignment" },
            { key: "costcenter", label: "Cost Center", path: "costcenter" },
            { key: "profitcenter", label: "Profit Center", path: "profitcenter" },
            { key: "internalorder", label: "Internal Order", path: "internalorder" },
            { key: "wbselement", label: "WBS Element", path: "wbselement" },
            { key: "businessarea", label: "Business Area", path: "businessarea" },
            { key: "assetvaluedate", label: "Asset Value Date", path: "assetvaluedate" },
            { key: "itemtext", label: "Item Text", path: "itemtext" },
            { key: "overrideglaccount", label: "Override GL Account", path: "overrideglaccount" },
            { key: "taxcode", label: "Tax Code", path: "taxcode" },
            { key: "segment", label: "Segment", path: "segment" },
            { key: "paymentterms", label: "Payment Term", path: "paymentterms" },
            { key: "paymentblockreason", label: "Payment Block", path: "paymentblockreason" },
            { key: "paymentmethod", label: "Payment Method", path: "paymentmethod" },
            { key: "baselinedate", label: "Baseline Date", path: "baselinedate" },
            { key: "valuedate", label: "Value Date", path: "valuedate" },
            { key: "contractnumber", label: "Contract Number", path: "contractnumber" },
            { key: "contracttype", label: "Contract Type", path: "contracttype" },
            { key: "housebank", label: "House Bank", path: "housebank" },
            { key: "bankaccountid", label: "Bank Account ID", path: "bankaccountid" },
            { key: "invoicerefnum", label: "Invoice Reference Number", path: "invoicerefnum" },
            { key: "invoicereffiscalyear", label: "Invoice Reference Fiscal Year", path: "invoicereffiscalyear" },
            { key: "invoicereflineitem", label: "Invoice Reference Line Item", path: "invoicereflineitem" },
            { key: "purchasingno", label: "Purchasing Order", path: "purchasingno" },
            { key: "purchasingitem", label: "Purchasing Item", path: "purchasingitem" },
            { key: "saleorder", label: "Sales Order", path: "saleorder" },
            { key: "saleorderitem", label: "Sales Order Item", path: "saleorderitem" },
            { key: "customer", label: "Customer", path: "customer" },
            { key: "cusgroup", label: "Customer Group", path: "cusgroup" },
            { key: "division", label: "Division", path: "division" },
            { key: "distributionchannel", label: "Distribution Channel", path: "distributionchannel" },
            { key: "salesorganization", label: "Sales Organization", path: "salesorganization" },
            { key: "salesoffice", label: "Sales Office", path: "salesoffice" },
            { key: "salesemployee", label: "Sales Employee", path: "salesemployee" },
            { key: "salesgroup", label: "Sales Group", path: "salesgroup" },
            { key: "materialgroup", label: "Material Group", path: "materialgroup" },
            { key: "product", label: "Product", path: "product" },
            { key: "alternativepayee", label: "Alternative Payee", path: "alternativepayee" },
            { key: "name1", label: "Name 1", path: "name1" },
            { key: "name2", label: "Name 2", path: "name2" },
            { key: "name3", label: "Name 3", path: "name3" },
            { key: "name4", label: "Name 4", path: "name4" },
            { key: "mst", label: "MST", path: "mst" },
            { key: "city", label: "City", path: "city" },
            { key: "country", label: "Country", path: "country" },
            { key: "ref1", label: "Ref 1", path: "ref1" },
            { key: "ref2", label: "Ref 2", path: "ref2" },
            { key: "ref3", label: "Ref 3", path: "ref3" },
            { key: "namecus1", label: "Individual Payee Name 1", path: "namecus1" },
            { key: "namecus2", label: "Individual Payee Name 2", path: "namecus2" },
            { key: "namecus3", label: "Individual Payee Name 3", path: "namecus3" },
            { key: "namecus4", label: "Individual Payee Name 4", path: "namecus4" },
            { key: "mstcus", label: "Individual Payee MST", path: "mstcus" },
            { key: "citycus", label: "Individual Payee City", path: "citycus" },
            { key: "countrycus", label: "Individual Payee Country", path: "countrycus" },
            { key: "productgroupmot", label: "Product group", path: "productgroupmot" },
            { key: "producttype", label: "Product type", path: "producttype" },
            { key: "orderid", label: "Order ID", path: "orderid" },
            { key: "material", label: "Material", path: "material" },
        ];

        return {
            register: function (oController, sTableId) {
                const oTable = oController.byId(sTableId);
                oController.oMetadataHelper = new MetadataHelper(COLUMN_METADATA);
                Engine.getInstance().register(oTable, {
                    helper: oController.oMetadataHelper,
                    controller: {
                        Columns: new SelectionController({ targetAggregation: "columns", control: oTable }),
                        Sorter: new SortController({ control: oTable }),
                        Groups: new GroupController({ control: oTable }),
                    },
                });
                Engine.getInstance().attachStateChange(
                    oController.handleStateChange.bind(oController)
                );
            },

            handleStateChange: function (oController, sTableId, oEvt) {
                const oTable = oController.byId(sTableId);
                const oState = oEvt.getParameter("state");
                if (!oState) return;
                const mColumns = {};
                oTable.getColumns().forEach((oCol) => (mColumns[oCol.getId()] = oCol));
                oTable.removeAllColumns();
                oState.Columns.forEach((oProp) => {
                    const oCol = oController.byId(oProp.key);
                    if (oCol) {
                        oCol.setVisible(true);
                        oTable.addColumn(oCol);
                        delete mColumns[oCol.getId()];
                    }
                });
                for (const sColId in mColumns) {
                    mColumns[sColId].setVisible(false);
                    oTable.addColumn(mColumns[sColId]);
                }
                const aSorter = [];
                oState.Sorter.forEach((oSorter) => {
                    const oColumn = oController.byId(oSorter.key);
                    if (oColumn) {
                        oColumn.setSorted(true);
                        oColumn.setSortOrder(oSorter.descending ? "Descending" : "Ascending");
                    }
                });
                oTable.getBinding("rows").sort(aSorter);
            },

            showAllColumns: function (oController, sTableId) {
                const oTable = oController.byId(sTableId);
                const aColumnsState = oController.oMetadataHelper
                    .getProperties()
                    .map((prop) => ({ key: prop.key }));
                Engine.getInstance()
                    .applyState(oTable, { Columns: aColumnsState })
                    .then(() => MessageToast.show("Hiển thị tất cả field"));
            },
        };
    }
);