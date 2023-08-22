odoo.define('alphabot.POS.Restaurant', function(require) {
    "use strict";

    const { Gui } = require('point_of_sale.Gui');
    var core = require('web.core');
    var models = require('point_of_sale.models');
    var field_utils = require('web.field_utils');

    var _super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        export_for_printing: function () {
            var result = _super_order.export_for_printing.apply(this, arguments);
//            console.log("aaaaaaaaaaaaaaaaaa");
//            console.log(typeof result);
//            console.log(result);
            result.mesa = result.table;
            result.table = false;
            result.customer_count = false;
//            console.log("bbbbbbbbbbbbbbbbbbbbb");
//            console.log(result);
            return result;
        },
    });
});