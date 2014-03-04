if (window.rcmail) {
    /*
     * EventListener to debug all action before events
     */
    /*
    rcmail.addEventListener('actionbefore', function(props) {
        console.log('before Listener');
        console.log(props);
    });
    */

    /*
     * EventListener to change the sorting order before we list the messages
     */
    rcmail.addEventListener('beforelist', function(props) {
        var folder = rcmail.env.mailbox;
        if (props) {
            if (typeof(props) == 'object' && props.ref == 'rcmail') {
                folder = props.env.mailbox;
            } else if (typeof(props) == 'string') {
                folder = props;
            }

            if (rcmail.task == 'mail') {
                var folder_sort;
                orig_col   = rcmail.env.sort_col;
                orig_order = rcmail.env.sort_order;
                console.log('beforelist');
                console.log(folder);
                console.log('beforelist before folder: ' + folder + ', col: ' + orig_col + ', order: ' + orig_order);

                if (rcmail.env.per_folder_sort) {
                    if (rcmail.env.per_folder_sort[folder]) {
                        folder_sort = rcmail.env.per_folder_sort[folder];
                    } else if (rcmail.env.per_folder_sort['default']) {
                        folder_sort = rcmail.env.per_folder_sort['default'];
                    } else {
                        folder_sort = orig_col + '_' + orig_order;
                    }

                    var y = folder_sort.split("_", 2);
                    col   = y[0];
                    order = y[1];
                    if (orig_col != col || orig_order != order) {
                        $('#rcm' + orig_col).removeClass('sorted' + (orig_order.toUpperCase()));
                        $('#rcm' + col).addClass('sorted' + order);
                        rcmail.env.sort_col   = col;
                        rcmail.env.sort_order = order;
                        console.log('beforelist changed folder: ' + folder + ', col: ' + col + ', order: ' + order);
                        rcmail.list_mailbox(folder, '', folder_sort);
                    }
                }
            }
        }
    });

    /*
     * EventListener to handle the header sort clicks
     */
    rcmail.addEventListener('aftersort', function(prop) {
        console.log('aftersort prop: ' + col);

        if (rcmail.task == 'mail') {
            mbox = rcmail.env.mailbox;

            http_lock = rcmail.set_busy(true, 'rc_foldersort.savingdata');
            var data  = {
                cmd: 'save_order',
                folder: mbox,
                col: rcmail.env.sort_col,
                order: rcmail.env.sort_order
            };
            console.log('aftersort data: ');
            console.log(data);
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
