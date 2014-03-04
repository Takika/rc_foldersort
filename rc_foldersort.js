function sort_list(props)
{
    var folder_sort;
    col = rcmail.env.sort_col;
    order = rcmail.env.sort_order=='ASC' ? 'DESC' : 'ASC';

    if (rcmail.env.per_folder_sort) {
        if (rcmail.env.per_folder_sort[props]) {
            folder_sort = rcmail.env.per_folder_sort[props];
        } else if (rcmail.env.per_folder_sort['default']) {
            folder_sort = rcmail.env.per_folder_sort['default'];
        } else {
            folder_sort = col + '_' + order;
        }

        var y = folder_sort.split("_", 2);
        col = y[0];
        order = y[1];
    }

    if (props && props != '') {
        rcmail.reset_qsearch();
    }

    if (rcmail.task == 'mail') {
        // set table header and update env
        rcmail.set_list_sorting(col, order);
        rcmail.list_mailbox(props, '', col+'_'+order);
        rcmail.set_button_titles();
    }
}

function sort_header(props)
{
    col = props;
    mbox = rcmail.env.mailbox;
    order = rcmail.env.sort_order=='ASC' ? 'DESC' : 'ASC';

    if (mbox && mbox != '') {
        rcmail.reset_qsearch();
    }

    if (rcmail.task == 'mail') {
        // set table header and update env
        rcmail.set_list_sorting(col, order);
        rcmail.list_mailbox(mbox, '', col+'_'+order);
        rcmail.set_button_titles();
        http_lock = rcmail.set_busy(true, 'rc_foldersort.savingdata');
        var data = {
            cmd: 'save_order',
            folder: mbox,
            col: rcmail.env.sort_col,
            order: rcmail.env.sort_order
        };
        rcmail.http_post('plugin.rc_foldersort_json', data, http_lock);
    }
}

rcmail.addEventListener('init', function() {
	// Handle folderlist click
	rcmail.register_command('plugin.rc_foldersort.sort_list', 'sort_list');
	rcmail.enable_command('plugin.rc_foldersort.sort_list', true);

	// TODO:
	// Handle header column click
	rcmail.register_command('plugin.rc_foldersort.sort_header', 'sort_header');
	rcmail.enable_command('plugin.rc_foldersort.sort_header', true);
});

rcmail.addEventListener('responsebefore', function(resp) {
    console.log(resp);
    console.log('responsebefore resp: task: ' + resp.task + ', action: ' + resp.action);
});
