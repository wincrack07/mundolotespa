odoo.define('point_of_sale.AlphabotPaymentScreen', function (require) {
    'use strict';

    const PaymentScreen = require('point_of_sale.PaymentScreen');
    const Registries = require('point_of_sale.Registries');
    const session = require('web.session');

    const AlphabotPaymentScreen = PaymentScreen => class extends PaymentScreen {
        async _postPushOrderResolve(order, order_server_ids) {
            var _alphabot_FEL_Doc = false;
            if(order.to_invoice==true)
            {
                _alphabot_FEL_Doc = await this.env.pos.get_order_fel_invoice_and_wait(order_server_ids[0]);
            }
//            console.log(_alphabot_FEL_Doc);
            order.set_alphabot_FEL_Doc(_alphabot_FEL_Doc);
            return super._postPushOrderResolve(...arguments);
        };

         async validateOrder(isForceValidate){
            if (this.currentOrder.finalized == true)
            {
                this.showPopup('ErrorPopup', {
                    title: this.env._t('Orden en validación'),
                    body: this.env._t("La orden se está validando con el backend"),
                });
                return;
            }
            return super.validateOrder(isForceValidate);
         };
    };

    Registries.Component.extend(PaymentScreen, AlphabotPaymentScreen);

    return PaymentScreen;
});
