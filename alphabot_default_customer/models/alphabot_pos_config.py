# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
import logging
_logger = logging.getLogger(__name__)


class PosConfigInherit(models.Model):
    _inherit = 'pos.config'

    alphabot_cliente_id = fields.Many2one('res.partner', string="Seleccionar cliente")
