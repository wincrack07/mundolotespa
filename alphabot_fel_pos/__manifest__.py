# -*- coding: utf-8 -*-
{
    "name": "Alphabot FEL POS",
    'summary': 'Factura electrónica para el POS',
    'description': 'Factura electrónica para el POS',

    'author': 'AlphaPos',
    'website': 'http://alphapos.biz',
    "support": "info@alphapos.biz",
    "license": "Other proprietary",
    'sequence': 10,
    'category': 'Point of Sale',
    'version': '0.15.23.04.27',
    'depends': ['base','account','point_of_sale','alphabot_fel_base'],

    'data': [   
        'security/ir.model.access.csv',
        'views/pos_config_view.xml',
        'views/res_company_views.xml',
    ],
    'assets': {
        'point_of_sale.assets': [
            'alphabot_fel_pos/static/lib/js/qrious.min.js',
            'alphabot_fel_pos/static/src/js/*',
        ],
        'web.assets_qweb': [
            'alphabot_fel_pos/static/src/xml/**/*',
        ],
    },
    'installable': True,
    'application': True,

    'images': ['static/description/logo.png'],
}
