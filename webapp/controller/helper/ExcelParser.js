sap.ui.define([], function () {
    "use strict";
    return {
        readFile: function (oFile) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.currentTarget.result);
                reader.onerror = (err) => reject(err);
                reader.readAsBinaryString(oFile);
            });
        },
        processExcelData: function (excelData) {
            let processedData = [];
            let errorMessages = [];
            // Hàng đầu tiên là dòng mô tả header, bỏ qua
            delete excelData[0];
            const iStartRow = 3;
            excelData.forEach((row, index) => {
                if (!row) return;
                const currentRowNumber = iStartRow + index;
                const value = { ...row };
                if (value.currency === "VND") {
                    const hasAmountDoc =
                        value.amountindoumentcurrency !== undefined &&
                        value.amountindoumentcurrency !== null &&
                        value.amountindoumentcurrency !== "";
                    if (hasAmountDoc && !value.amountinlocalcurrency) {
                        value.amountinlocalcurrency = value.amountindoumentcurrency;
                    }
                    const hasTaxBase =
                        value.taxbaseamount !== undefined &&
                        value.taxbaseamount !== null &&
                        value.taxbaseamount !== "";
                    if (hasTaxBase && !value.localtaxbaseamount) {
                        value.localtaxbaseamount = value.taxbaseamount;
                    }
                } else {
                    let exchangeRate = 0;
                    if (value.exchangerate) {
                        let sRate = String(value.exchangerate).replace(/\./g, "");
                        sRate = sRate.replace(",", ".");
                        exchangeRate = parseFloat(sRate);
                        value.exchangerate = exchangeRate;
                    }
                    if (exchangeRate > 0) {
                        if (!value.amountinlocalcurrency) {
                            value.amountinlocalcurrency = Math.round(
                                value.amountindoumentcurrency * exchangeRate
                            );
                        }
                        const hasTaxBase =
                            value.taxbaseamount !== undefined &&
                            value.taxbaseamount !== null &&
                            value.taxbaseamount !== "";
                        if (hasTaxBase && !value.localtaxbaseamount) {
                            value.localtaxbaseamount = Math.round(
                                value.taxbaseamount * exchangeRate
                            );
                        }
                    }
                }
                processedData.push({ ...value, stt: currentRowNumber });
            });
            return { data: processedData, errors: errorMessages };
        },
    };
});