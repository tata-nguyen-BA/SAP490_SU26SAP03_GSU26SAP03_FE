sap.ui.define([], function () {
    "use strict";

    // Nguồn duy nhất định nghĩa 88 cột bảng Upload FI.
    // key: trùng key trong ExcelTemplate/ExcelParser (row 1 của template)
    // label: nhãn ngắn hiển thị trên cột + trong dialog chọn cột
    // width: độ rộng cột sap.ui.table
    // visible: true = thuộc 13 cột mặc định
    const COLUMNS = [
        { key: "id_doc",                  label: "ID",                          width: "5rem",  visible: true },
        { key: "documentdate",            label: "Document Date",               width: "10rem", visible: true },
        { key: "postingdate",             label: "Posting Date",                width: "10rem", visible: true },
        { key: "documenttype",            label: "Doc Type",                    width: "9rem",  visible: true },
        { key: "companycode",             label: "Company Code",                width: "9rem",  visible: true },
        { key: "currency",                label: "Currency",                    width: "8rem"  },
        { key: "exchangerate",            label: "Exchange Rate",               width: "9rem"  },
        { key: "headertext",              label: "Header Text",                 width: "14rem" },
        { key: "referencedoc",            label: "Reference Doc",               width: "12rem" },
        { key: "headerref1",              label: "Header Ref 1",                width: "10rem" },
        { key: "negativeposting",         label: "Negative Posting",            width: "9rem",  visible: true },
        { key: "postingkey",              label: "Posting Key",                 width: "8rem"  },
        { key: "account",                 label: "Account",                     width: "14rem", visible: true },
        { key: "mainassetnumber",         label: "Main Asset Number",           width: "11rem" },
        { key: "subassetnumber",          label: "Sub Asset Number",            width: "11rem" },
        { key: "specialglaccount",        label: "Special GL Indicator",        width: "10rem" },
        { key: "assettransactiontype",    label: "Asset Trans. Type",           width: "10rem" },
        { key: "amountindoumentcurrency", label: "Amount Doc Cur",              width: "14rem", visible: true },
        { key: "amountinlocalcurrency",   label: "Amount Local Cur",            width: "14rem", visible: true },
        { key: "taxbaseamount",           label: "Tax Base Amt (Doc)",          width: "12rem" },
        { key: "localtaxbaseamount",      label: "Tax Base Amt (Local)",        width: "12rem" },
        { key: "assignment",              label: "Assignment",                  width: "10rem" },
        { key: "costcenter",              label: "Cost Center",                 width: "12rem", visible: true },
        { key: "profitcenter",            label: "Profit Center",               width: "12rem", visible: true },
        { key: "internalorder",           label: "Internal Order",              width: "10rem" },
        { key: "wbselement",              label: "WBS Element",                 width: "10rem" },
        { key: "businessarea",            label: "Business Area",               width: "9rem"  },
        { key: "assetvaluedate",          label: "Asset Value Date",            width: "10rem" },
        { key: "itemtext",                label: "Item Text",                   width: "14rem", visible: true },
        { key: "longtext",                label: "Long Text",                   width: "16rem" },
        { key: "overrideglaccount",       label: "Override GL Account",         width: "11rem" },
        { key: "taxcode",                 label: "Tax Code",                    width: "7rem",  visible: true },
        { key: "segment",                 label: "Segment",                     width: "9rem"  },
        { key: "paymentterms",            label: "Payment Term",                width: "9rem"  },
        { key: "paymentblockreason",      label: "Payment Block",               width: "9rem"  },
        { key: "paymentmethod",           label: "Payment Method",              width: "9rem"  },
        { key: "baselinedate",            label: "Baseline Date",               width: "10rem" },
        { key: "valuedate",               label: "Value Date",                  width: "10rem" },
        { key: "netduedate",              label: "Net Due Date",                width: "10rem" },
        { key: "contractnumber",          label: "Contract Number",             width: "11rem" },
        { key: "contracttype",            label: "Contract Type",               width: "9rem"  },
        { key: "housebank",               label: "House Bank",                  width: "9rem"  },
        { key: "bankaccountid",           label: "Bank Account ID",             width: "10rem" },
        { key: "invoicerefnum",           label: "Invoice Ref. Number",         width: "11rem" },
        { key: "invoicereffiscalyear",    label: "Invoice Ref. Fiscal Year",    width: "11rem" },
        { key: "invoicereflineitem",      label: "Invoice Ref. Line Item",      width: "11rem" },
        { key: "purchasingno",            label: "Purchasing Doc. No.",         width: "11rem" },
        { key: "purchasingitem",          label: "Purchasing Doc. Item",        width: "10rem" },
        { key: "saleorder",               label: "Sales Order",                 width: "10rem" },
        { key: "saleorderitem",           label: "Sales Order Item",            width: "10rem" },
        { key: "customer",                label: "Customer",                    width: "10rem" },
        { key: "cusgroup",                label: "Customer Group",              width: "10rem" },
        { key: "division",                label: "Division",                    width: "9rem"  },
        { key: "distributionchannel",     label: "Distribution Channel",        width: "10rem" },
        { key: "salesorganization",       label: "Sales Organization",          width: "10rem" },
        { key: "salesoffice",             label: "Sales Office",                width: "9rem"  },
        { key: "salesemployee",           label: "Sales Employee",              width: "10rem" },
        { key: "salesgroup",              label: "Sales Group",                 width: "9rem"  },
        { key: "materialgroup",           label: "Material Group",              width: "10rem" },
        { key: "product",                 label: "Product",                     width: "10rem" },
        { key: "unit",                    label: "Unit of Measure",             width: "8rem"  },
        { key: "baseunit",                label: "Base Unit",                   width: "8rem"  },
        { key: "quantity",                label: "Quantity",                    width: "9rem"  },
        { key: "alternativepayee",        label: "Alternative Payee",           width: "11rem" },
        { key: "name1",                   label: "Name 1 (Vãng lai)",           width: "12rem" },
        { key: "name2",                   label: "Name 2 (Vãng lai)",           width: "12rem" },
        { key: "name3",                   label: "Name 3 (Vãng lai)",           width: "12rem" },
        { key: "name4",                   label: "Name 4 (Vãng lai)",           width: "12rem" },
        { key: "mst",                     label: "MST (Vãng lai)",              width: "10rem" },
        { key: "city",                    label: "City (Vãng lai)",             width: "10rem" },
        { key: "country",                 label: "Country (Vãng lai)",          width: "9rem"  },
        { key: "vatregno",                label: "VAT Reg. No.",                width: "10rem" },
        { key: "ref1",                    label: "Ref 1",                       width: "8rem"  },
        { key: "ref2",                    label: "Ref 2",                       width: "8rem"  },
        { key: "ref3",                    label: "Ref 3",                       width: "8rem"  },
        { key: "namecus1",                label: "Payee Name 1",                width: "12rem" },
        { key: "namecus2",                label: "Payee Name 2",                width: "12rem" },
        { key: "namecus3",                label: "Payee Name 3",                width: "12rem" },
        { key: "namecus4",                label: "Payee Name 4",                width: "12rem" },
        { key: "mstcus",                  label: "Payee MST",                   width: "10rem" },
        { key: "citycus",                 label: "Payee City",                  width: "10rem" },
        { key: "countrycus",              label: "Payee Country",               width: "9rem"  },
        { key: "countrygl",               label: "Country GL",                  width: "9rem"  },
        { key: "plant",                   label: "Plant",                       width: "8rem"  },
        { key: "productgroupmot",         label: "Product Group",               width: "10rem" },
        { key: "producttype",             label: "Product Type",                width: "10rem" },
        { key: "orderid",                 label: "Order ID",                    width: "9rem"  },
        { key: "material",                label: "Material",                    width: "10rem" },
    ];

    return {
        getColumns: function () {
            // Trả bản copy để không ai sửa nhầm config gốc
            return COLUMNS.map((c) => Object.assign({}, c));
        },

        getDefaultVisibleKeys: function () {
            return COLUMNS.filter((c) => c.visible === true).map((c) => c.key);
        },

        getAllKeys: function () {
            return COLUMNS.map((c) => c.key);
        },
    };
});