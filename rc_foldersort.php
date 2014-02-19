<?php
/*
 */

class rc_foldersort extends rcube_plugin
{
    public $task = 'mail|settings';

    private $rc;

    private $uname;
    private $debug;

    public function init()
    {
        $this->rc         = rcube::get_instance();
        $this->uname      = $this->rc->user->get_username();
        $sort_order       = $this->rc->config->get('per_folder_sort', array('default' => 'date_DESC'));
        $this->rc->output->set_env('per_folder_sort', $sort_order);

        if ($this->rc->task == 'settings') {
            $this->add_hook('folder_form', array($this, 'folder_form_hook'));
            $this->add_hook('folder_update', array($this, 'folder_update_hook'));
            $this->add_hook('preferences_list', array($this, 'preferences_list_hook'));
            $this->add_hook('preferences_save', array($this, 'preferences_save_hook'));
        }

        if ($this->rc->task == 'mail') {
            $this->include_script('rc_foldersort.js');
            $this->register_action('plugin.rc_foldersort_json', array($this, 'sort_json_action'));
            $this->add_hook('render_page', array($this, 'render_page_hook'));
        }
    }

    public function folder_form_hook($args)
    {
        $content = $args['form']['props']['fieldsets']['settings']['content'];
        $options = $args['options'];
        $mbox    = $options['name'];

        $cols = array(
            'from',
            'to',
            'subject',
            'date',
            'size',
        );

        $folder_sorts = $this->rc->config->get('per_folder_sort', array('default' => 'date_DESC'));
        if (array_key_exists($mbox, $folder_sorts)) {
            $folder_sort = $folder_sorts[$mbox];
        } else if (array_key_exists('default', $folder_sorts)) {
            $folder_sort = $folder_sorts['default'];
        } else {
            $folder_sort = 'date_DESC';
        }

        list($col, $order) = explode('_', $folder_sort);
        if ($order != 'DESC' && $order != 'ASC') {
            $order = 'DESC';
        }

        if (!in_array($col, $cols)) {
            $col = 'date';
        }

        if (is_array($content) && !array_key_exists('_sortcol', $content)) {
            $folder_sort_col_select = new html_select(array('name' => '_sortcol', 'id' => '_sortcol'));
            foreach ($cols as $temp_col) {
                $folder_sort_col_select->add(rcube_label($temp_col), $temp_col);
            }

            $content['_sortcol'] = array(
                'label' => rcube_label('listsorting'),
                'value' => $folder_sort_col_select->show($col),
            );
        }

        if (is_array($content) && !array_key_exists('_sortcol', $options)) {
            $options['_sortcol'] = $col;
        }

        if (is_array($content) && !array_key_exists('_sortord', $content)) {
            $folder_sort_order_select = new html_select(array('name' => '_sortord', 'id' => '_sortord'));
            $folder_sort_order_select->add(rcube_label('asc'), 'ASC');
            $folder_sort_order_select->add(rcube_label('desc'), 'DESC');
            $content['_sortord'] = array(
                'label' => rcube_label('listorder'),
                'value' => $folder_sort_order_select->show($order),
            );
        }

        if (is_array($content) && !array_key_exists('_sortord', $options)) {
            $options['_sortord'] = $order;
        }

        $args['form']['props']['fieldsets']['settings']['content'] = $content;

        $args['options'] = $options;

        return $args;
    }

    public function folder_update_hook($args)
    {
        $mbox             = $args['record']['name'];
        $settings         = $args['record']['settings'];
        $sort_order       = $settings['sort_column'] . '_' . $settings['sort_order'];
        $cfg_sort         = $this->rc->config->get('per_folder_sort', array('default' => 'date_DESC'));
        $cfg_sort[$mbox]  = $sort_order;

        $this->rc->user->save_prefs(array('per_folder_sort' => $cfg_sort));
        $this->rc->output->set_env('per_folder_sort', $cfg_sort);

        return $args;
    }

    public function preferences_list_hook($args)
    {
        if ($args['section'] == 'mailbox') {
            $cols = array(
                'from',
                'to',
                'subject',
                'date',
                'size',
            );

            $folder_sorts = $this->rc->config->get('per_folder_sort', array('default' => 'date_DESC'));
            if (array_key_exists('default', $folder_sorts)) {
                $folder_sort = $folder_sorts['default'];
            } else {
                $folder_sort = 'date_DESC';
            }

            list($col, $order) = explode('_', $folder_sort);
            if ($order != 'DESC' && $order != 'ASC') {
                $order = 'DESC';
            }

            if (!in_array($col, $cols)) {
                $col = 'date';
            }

            $sort_select_col = new html_select(array('name' => '_default_sort_col', 'id' => '_default_sort_col'));
            foreach ($cols as $temp_col) {
                $sort_select_col->add(rcube_label($temp_col), $temp_col);
            }

            $sort_select_order = new html_select(array('name' => '_default_sort_order', 'id' => '_default_sort_order'));
            $sort_select_order->add(rcube_label('asc'), 'ASC');
            $sort_select_order->add(rcube_label('desc'), 'DESC');
            $sort_options = array(
                'title' => rcube_label('listorder'),
                'content' => $sort_select_col->show($col) . $sort_select_order->show($order),
            );

            $args['blocks']['main']['options']['listorder'] = $sort_options;
        }

        return $args;
    }

    public function preferences_save_hook($args)
    {
        if ($args['section'] == 'mailbox') {
            $folder_sort_col                  = get_input_value('_default_sort_col', RCUBE_INPUT_POST);
            $folder_sort_order                = get_input_value('_default_sort_order', RCUBE_INPUT_POST);
            $folder_sort                      = $folder_sort_col . '_' . $folder_sort_order;
            $folder_sorts                     = $this->rc->config->get('per_folder_sort', array('default' => 'date_DESC'));
            $folder_sorts['default']          = $folder_sort;
            $args['prefs']['per_folder_sort'] = $folder_sorts;
        }

        return $args;
    }

    public function sort_json_action()
    {
        $cmd    = get_input_value('cmd', RCUBE_INPUT_POST);
        $folder = get_input_value('folder', RCUBE_INPUT_POST);
        $col    = get_input_value('col', RCUBE_INPUT_POST);
        $order  = get_input_value('order', RCUBE_INPUT_POST);

        if ($cmd == 'save_order') {
            $sort_order          = $this->rc->config->get('per_folder_sort', array('default' => 'date_DESC'));
            $sort_order[$folder] = $col . "_" . $order;

            $this->rc->user->save_prefs(array('per_folder_sort' => $sort_order));
            $this->rc->output->set_env('per_folder_sort', $sort_order);
        }
    }

    public function render_page_hook($args)
    {
        $args['content'] = preg_replace('|onclick="return rcmail.command\(\'list\'|', 'onclick="return rcmail.command(\'plugin.rc_foldersort.sort_list\'', $args['content']);
        $args['content'] = preg_replace('|onclick="return rcmail.command\(\'sort\'|', 'onclick="return rcmail.command(\'plugin.rc_foldersort.sort_header\'', $args['content']);

        return $args;
    }

    private function _debug($value, $key = '', $force = false)
    {
        if ($this->debug || $force) {
            $trace           = debug_backtrace(DEBUG_BACKTRACE_PROVIDE_OBJECT);
            $caller_trace    = $trace[0];
            $caller_function = $trace[1]['function'];
            $caller_line     = $caller_trace['line'];
            $caller_file     = $caller_trace['file'];
            $caller_file     = preg_replace("|.*/|", "", $caller_file);
            $str             = sprintf("[%s:%d - %s] ", $caller_file, $caller_line, $caller_function);

            $val_type = gettype($value);

            switch ($val_type) {
                case "object": {
                    $old_value = $value;
                    $value     = get_class($old_value);
                    $str      .= $key . ' type = ' . $value;
                    break;
                }
                default: {
                    $old_value = $value;
                    $value     = var_export($old_value, true);
                    $str      .= $key. ' = ' .$value;
                    break;
                }
            }

            if ($this->uname) {
                $str = sprintf("[%s] %s", $this->uname, $str);
            }

            write_log($this->ID, $str);
        }
    }

}
?>
