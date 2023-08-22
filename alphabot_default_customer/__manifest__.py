# -*- coding: utf-8 -*-
{
    "name": "Alphabot Default Customer",
    'summary': 'Cliente por defecto en el POS',
    'description': 'Cliente por defecto en el POS',

    'author': 'AlphaPos',
    'website': 'http://alphapos.biz',
    "support": "info@alphapos.biz",
    "license": "Other proprietary",
    'sequence': 10,
    'category': 'Point of Sale',
    'version': '0.15.23.07.04',
    'depends': ['base','account','point_of_sale'],

    'data': [
        'views/pos_config_view.xml',
    ],
    'assets': {
        'point_of_sale.assets': [
            'alphabot_default_customer/static/src/js/*',
        ],
        'web.assets_qweb': [
            'alphabot_default_customer/static/src/xml/**/*',
        ],
    },
    'installable': True,
    'application': True,

    'images': ['static/description/logo.png'],
}
