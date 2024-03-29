odoo.define('alphabot.POS', function(require) {
    "use strict";

    const { Gui } = require('point_of_sale.Gui');
    var core = require('web.core');
    var models = require('point_of_sale.models');
    var field_utils = require('web.field_utils');

    var _super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        initialize: function() {
            _super_order.initialize.apply(this, arguments);
            if (this.pos.config.alphabot_cliente_id) {
                var cliente = this.get_client();
//                console.log(cliente);
                if (!cliente) {
                    console.log("cliente autodefinido");
//                    console.log(cliente);
            	    this.set_client(this.pos.db.get_partner_by_id(this.pos.config.alphabot_cliente_id[0]));
            	}
				this.to_invoice = true;
            }

        },
    });

    var _super_posmodel = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        push_and_invoice_order: function (order) {
            var self = this;
            return new Promise((resolve, reject) => {
                if (!order.get_client()) {
                    reject({ code: 400, message: 'Missing Customer', data: {} });
                } else {
                    var order_id = self.db.add_order(order.export_as_JSON());
                    self.flush_mutex.exec(async () => {
                        try {
                            const server_ids = await self._flush_orders([self.db.get_order(order_id)], {
                                timeout: 30000,
                                to_invoice: true,
                            });
                            if (server_ids.length) {
                                const [orderWithInvoice] = await self.rpc({
                                    method: 'read',
                                    model: 'pos.order',
                                    args: [server_ids, ['account_move']],
                                    kwargs: { load: false },
                                });
                            } else {
                                reject({ code: 401, message: 'Backend Invoice', data: { order: order } });
                            }
                            resolve(server_ids);
                        } catch (error) {
                            reject(error);
                        }
                    });
                }
            });
        },
    });

});