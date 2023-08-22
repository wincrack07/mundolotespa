odoo.define('point_of_sale.ClientDetails', function (require) {
    'use strict';

    var models = require('point_of_sale.models');

    var _super_posmodel = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        initialize: function(session,attributes)
        {
            //console.log("'oooooooooooooooooooooooo");
            var contact_model = _.find(this.models,function(model)
            {
                return model.model === 'res.partner';
            });
            contact_model.fields.push('company_type','alphabot_fel_dv','alphabot_fel_company_type');
            var test_modelo = _super_posmodel.initialize.call(this,session,attributes);
            return test_modelo
        },
    });
});

