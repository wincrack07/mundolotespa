odoo.define('alphabot.GetCustomer', function(require) {
    "use strict";

    var models = require('point_of_sale.models');

    var _super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        initialize: function() {
            _super_order.initialize.apply(this, arguments);
            if (this.pos.config.alphabot_cliente_id) {
            	this.set_client(this.pos.db.get_partner_by_id(this.pos.config.alphabot_cliente_id[0]));
				this.to_invoice = true;
            }
        },
    });
	
});