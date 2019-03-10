var contractorsColumn = new Ext.grid.ColumnModel({
    columns: [
        { header: 'id_op', dataIndex: 'id_op', id: 'id_op', width: 50, hideable: false },
        {
            header: 'opdate', dataIndex: 'opdate', filter: {
                type: 'LIST',
                value: ['1']
            }
        },
        { header: 'code', dataIndex: 'code' },
        { header: 'id_status', dataIndex: 'id_status', hidden: true },
        { header: 'status', dataIndex: 'status', width: 150 },
        { header: 'id_type', dataIndex: 'id_type', hidden: true, },
        { header: 'optype', dataIndex: 'optype', width: 150 },
        { header: 'opsumm', dataIndex: 'opsumm' },
        { header: 'gm_res', dataIndex: 'gm_res' },
        { header: 'doccount', dataIndex: 'doccount' },
        { header: 'id_rack', dataIndex: 'id_rack' },
        { header: 'id_contr', dataIndex: 'id_contr', hidden: true },
        { header: 'contr_name', dataIndex: 'contr_name', hidden: true },
        { header: 'inn', dataIndex: 'inn', hidden: true },
        { header: 'id_ws', dataIndex: 'id_ws', hidden: true },
        { header: 'ws_name', dataIndex: 'ws_name', hidden: true, },
    ],
    defaults: {
        sortable: true,
        menuDisabled: false
    },

    defaultWidth: 80
});