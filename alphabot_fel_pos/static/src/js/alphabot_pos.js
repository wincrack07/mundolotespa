odoo.define('alphabot.POS', function(require) {
    "use strict";

    const { Gui } = require('point_of_sale.Gui');
    var core = require('web.core');
    var models = require('point_of_sale.models');
    var field_utils = require('web.field_utils');

    var _t = core._t;

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
            var alphabot_FEL_Doc;
        },
        export_for_printing: function () {
            var result = _super_order.export_for_printing.apply(this, arguments);
            result.alphabot_FEL_Doc = this.get_alphabot_FEL_Doc();
//            console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
//            console.log(result.alphabot_FEL_Doc);
            if(typeof result.date.localestring == 'undefined')
            {
                var d  = new Date();
                result.date.localestring = field_utils.format.datetime(moment(d), {}, {timezone: false});
            }

            var company = this.pos.company;
            result.company.alphabot_fel_pac_msg = company.alphabot_fel_pac_msg;
            result.company.street = company.street;

            return result;
        },
        set_alphabot_FEL_Doc: function (alphabot_FEL_Doc){
          this.alphabot_FEL_Doc = alphabot_FEL_Doc;
        },
        get_alphabot_FEL_Doc: function () {
            return this.alphabot_FEL_Doc;
        },
        wait_for_push_order: function () {
            var result = _super_order.wait_for_push_order.apply(this, arguments);
            result = Boolean(result || this.pos.is_panama_country());
            return result;
        }
    });
	
//	var _super_orderline = models.Orderline.prototype;
//	models.Orderline = models.Orderline.extend({
//		export_for_printing: function(){
//			var json = _super_orderline.export_for_printing.call(this);
//			json.note = this.note;
//			return json;
//		},
//	});

	var _super_posmodel = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        initialize: function(session,attributes)
        {
            var company_model = _.find(this.models,function(model)
            {
                return model.model === 'res.company';
            });
            company_model.fields.push('alphabot_fel_active','alphabot_fel_pac_msg','street');
            return _super_posmodel.initialize.call(this,session,attributes);
        },
        is_panama_country: function(){
          var panama_country = ['PA'];
          if (!this.company.country) {
            Gui.showPopup("ErrorPopup", {
                'title': _t("Pais no definido"),
                'body':  _t("La empresa no tiene un pais definido."),
            });
            return false;
          }
          return _.contains(panama_country, this.company.country.code);
        },
//        async _flush_orders(orders, options){
//     	    var resp = await _super_posmodel._flush_orders.apply(this, arguments);
//            console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbb _flush_orders");
//            console.log(resp);
//            return resp
//        },
        push_and_invoice_order: function (order) {
            var self = this;
            if (!this.company.alphabot_fel_active){
                return _super_posmodel.push_and_invoice_order.call(this, order);
            }
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
                                if (orderWithInvoice && orderWithInvoice.account_move) {
//                                    console.log("done push_and_invoice_order");
                                    var active_ids =  [orderWithInvoice.account_move];
                                    await self.rpc({
                                        method: 'action_fel_move_from_pos',
                                        model: 'account.move',
                                        args: [[],active_ids],
                                    });
                                }
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

        async get_order_fel_invoice_and_wait(order_id) {

            Gui.setSyncStatus('connecting');

            try {
              var _alphabot_FEL_Doc = false;
                if(this.is_panama_country()) {
                    var ciclo = 10;
                    if (!this.company.alphabot_fel_active){
                        ciclo = 1;
                    }
                    while (ciclo>0)
                    {
                        console.log(ciclo);
                        _alphabot_FEL_Doc = false;
                        await this.rpc({
                              model: 'pos.order',
                              method: 'get_invoice',
                              args: [order_id],
                        }).then(function (result) {
//                            console.log('wwwwwwwwwwww result');
//                           console.log(result);
                            _alphabot_FEL_Doc = (result || false);
                        });

                        if((_alphabot_FEL_Doc != false) && (_alphabot_FEL_Doc.Tipo != false))
                        {
//                            console.log('wwwwwwwwwwww bien');
                            ciclo = 0;
                        }
                        else
                        {
                            ciclo = ciclo - 1;
                        }
                    }
                }
             } catch (error) {
                if (error instanceof Error) {
                    throw error;
                } else {
                    // NOTE: error here is most probably undefined
                    Gui.showPopup("ErrorPopup", {
                        'title': _t("Network Error"),
                        'body':  _t("Unable to download invoice."),
                    });
                }
            }

            Gui.setSyncStatus('connected');

            return _alphabot_FEL_Doc;
        }
    });


});