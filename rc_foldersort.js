/* function sort_list(props)
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
*/

/* function sort_header(props)
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
*/

/* rcmail.addEventListener('init', function() {
	// Handle folderlist click
	rcmail.register_command('plugin.rc_foldersort.sort_list', 'sort_list');
	rcmail.enable_command('plugin.rc_foldersort.sort_list', true);

	// TODO:
	// Handle header column click
	rcmail.register_command('plugin.rc_foldersort.sort_header', 'sort_header');
	rcmail.enable_command('plugin.rc_foldersort.sort_header', true);
});
*/

if (window.rcmail) {
    /* 
     * EventListener to debug all action before events
     */
    rcmail.addEventListener('actionbefore', function(props) {
        console.log('before Listener');
        console.log(props);
    });

    /*
     * EventListener to change the sorting order before we list the messages
     */
    rcmail.addEventListener('beforelist', function(props) {
        if (props && rcmail.task == 'mail') {
            var folder_sort;
            orig_col = rcmail.env.sort_col;
            orig_order = rcmail.env.sort_order;
            console.log('beforelist');
            console.log(props);
            console.log('beforelist before folder: ' + props + ', col: ' + orig_col + ', order: ' + orig_order);
    
            if (rcmail.env.per_folder_sort) {
                if (rcmail.env.per_folder_sort[props]) {
                    folder_sort = rcmail.env.per_folder_sort[props];
                } else if (rcmail.env.per_folder_sort['default']) {
                    folder_sort = rcmail.env.per_folder_sort['default'];
                } else {
                    folder_sort = orig_col + '_' + orig_order;
                }
    
                var y = folder_sort.split("_", 2);
                col   = y[0];
                order = y[1];
                if (orig_col != col || orig_order != order) {
                    rcmail.env.sort_col = col;
                    rcmail.env.sort_order = order;
                    // rcmail.list_mailbox(props, '', folder_sort);
                    console.log('beforelist changed folder: ' + props + ', col: ' + col + ', order: ' + order);
                }
            }
        }
    });

    /*
     * EventListener to handle the header sort clicks
     */
    rcmail.addEventListener('beforesort', function(col) {
        console.log('beforesort col: ' + col);

        if (rcmail.task == 'mail') {
            mbox  = rcmail.env.mailbox;
            order = rcmail.env.sort_order=='ASC' ? 'DESC' : 'ASC';
            http_lock = rcmail.set_busy(true, 'rc_foldersort.savingdata');
            var data = {
                cmd: 'save_order',
                folder: mbox,
                col: rcmail.env.sort_col,
                order: rcmail.env.sort_order
            };
            rcmail.http_post('plugin.rc_foldersort_json', data, http_lock);
        }
    });

    /*
     * EventListener to debug the list http_response reply
     */
    rcmail.addEventListener('responsebeforelist', function(resp) {
        response = resp.response;
        if (rcmail.task == 'mail') {
            console.log('responsebefore list folder: ' + response.env.mailbox + ', col: ' + rcmail.env.sort_col + ', order: ' + rcmail.env.sort_order);
        }
        
        // console.log(response);
        // console.log('responsebefore resp: task: ' + rcmail.task + ', action: ' + response.action);
        
    });

}
