<?php
/*
 */

class rc_foldersort extends rcube_plugin
{
    public $task = 'mail|settings';

    private $rc;
    private $sort_order;

    private $uname;
    private $debug = false;

    public function init()
    {
        $this->rc         = rcube::get_instance();
        $this->sort_order = $this->rc->config->get('per_folder_sort', array('default' => 'date_DESC'));
        $this->rc->output->set_env('per_folder_sort', $this->sort_order);

        $this->uname = $this->rc->user->get_username();

        if ($this->rc->task == 'settings') {
            $this->add_hook('folder_form', array($this, 'folder_form_hook'));
        }
    }

    public function folder_form_hook($args)
    {
        $content = $args['form']['props']['fieldsets']['settings']['content'];
        $options = $args['options'];
        $mbox    = $options['name'];

        $this->_debug($args, 'folder_form output', true);
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

            write_log('iwd_mail', $str);
        }
    }

}
?>
