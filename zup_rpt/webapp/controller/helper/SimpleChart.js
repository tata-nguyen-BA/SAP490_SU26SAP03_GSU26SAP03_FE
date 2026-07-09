sap.ui.define([], function () {
    "use strict";

    // Chart cột SVG thuần - thay sap.viz (sap.viz kéo RequireJS vào trang,
    // xung đột với SheetJS bundle: bundle thấy global require -> tưởng Node
    // -> require("stream") -> chết module. Vẽ tay thì không đụng ai.

    function _esc(s) {
        return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    return {
        /**
         * @param {Array<{label:string, value:number}>} aData
         * @returns {string} SVG markup (1 root element)
         */
        columns: function (aData) {
            if (!aData || !aData.length) {
                return '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40">' +
                       '<text x="8" y="24" font-size="13" fill="#666" font-family="Arial">Không có dữ liệu</text></svg>';
            }
            const iBarW = 56, iGap = 24, iChartH = 170, iTopPad = 24, iBottomPad = 28, iLeftPad = 12;
            const fMax = Math.max.apply(null, aData.map((d) => d.value)) || 1;
            const iW = iLeftPad * 2 + aData.length * (iBarW + iGap) - iGap;
            const iH = iTopPad + iChartH + iBottomPad;

            let s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + iW + '" height="' + iH +
                    '" font-family="Arial,Helvetica,sans-serif">';
            // trục đáy
            s += '<line x1="0" y1="' + (iTopPad + iChartH + 0.5) + '" x2="' + iW + '" y2="' +
                 (iTopPad + iChartH + 0.5) + '" stroke="#ccc" stroke-width="1"/>';

            aData.forEach((d, i) => {
                const x = iLeftPad + i * (iBarW + iGap);
                const iBarH = Math.max(2, Math.round((d.value / fMax) * iChartH));
                const y = iTopPad + iChartH - iBarH;
                const sVal = Number(d.value).toLocaleString("vi-VN", { maximumFractionDigits: 2 });
                s += '<rect x="' + x + '" y="' + y + '" width="' + iBarW + '" height="' + iBarH +
                     '" rx="3" fill="#0a6ed1"/>';
                s += '<text x="' + (x + iBarW / 2) + '" y="' + (y - 6) +
                     '" text-anchor="middle" font-size="12" fill="#333">' + _esc(sVal) + '</text>';
                s += '<text x="' + (x + iBarW / 2) + '" y="' + (iTopPad + iChartH + 18) +
                     '" text-anchor="middle" font-size="12" fill="#666">' + _esc(d.label) + '</text>';
            });
            return s + "</svg>";
        },
    };
});
