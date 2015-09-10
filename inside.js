(function(window, document, undefined) {

var protocol = window.location.protocol === 'https:' ? window.location.protocol : 'http:',
    body = document.body;

var App = {
    init: function() {
        this._initDom();
        this._initBridge();
        this._initEvents();
    },
    messageText: function(id) {
        var text = '';
        switch(id) {
            case 'update-bridge':
                text = 'Установка соединения с typograf.github.io.';
            break;
            case 'selected':
                text = 'Текст выбран.';
            break;
            case 'select':
                text = 'Выделите текст в текстовом поле.';
            break;
            case 'ok':
                text = 'Готово.';
            break;
        }

        this._message.innerHTML = text;
    },
    destroy: function() {
        removeEvent(document, 'focus', this._onfocus);
        removeEvent(window, 'message', this._onmessage);
        removeEvent(document, 'mouseup', this._onmouseup);
        removeEvent(document, 'select', this._onselect, true);

        body.removeChild(this._iframe);
        body.removeChild(this._toolbar);
        body.removeChild(this._style);
    },
    _isLoaded: false,
    _paste: function(el, text) {
        var start = el.selectionStart,
            end = el.selectionEnd;

        if(start === end) {
            el.value = text;
        } else {
            el.value = el.value.substr(0, el.selectionStart) + text + el.value.substr(el.selectionEnd);
        }

        el.selectionStart = el.selectionEnd = start;
    },
    _getSelection: function() {
        var active = document.activeElement,
            text = '';
        if(active && (active.tagName.toLowerCase() === 'input' || active.tagName.toLowerCase() === 'textarea')) {
            if(active.selectionStart === active.selectionEnd) {
                text = active.value;
            } else {
                text = active.value.substring(active.selectionStart, active.selectionEnd);
            }
        } else {
            active = null;
        }

        return {
            el: active,
            text: text
        };
    },
    _getIframeUrl: function() {
        return protocol + '//typograf.github.io';
    },
    _updateIframe: function() {
        this._isLoaded = false;
        this._iframe.src = this._getIframeUrl();
        this.messageText('update-bridge');
    },
    _initDom: function() {
        var toolbar = document.createElement('div');
        toolbar.className = 'typograf-toolbar';
        this._toolbar = toolbar;

        var execute = document.createElement('span');
        execute.className = 'typograf-button typograf-button_execute';
        execute.innerHTML = 'Типографировать';
        toolbar.appendChild(execute);
        this._buttonExecute = execute;

        var prefs = document.createElement('a');
        prefs.className = 'typograf-button typograf-button_prefs';
        prefs.target = '_blank';
        prefs.href = this._getIframeUrl() + '#!prefs';
        prefs.innerHTML = 'Настройки';
        toolbar.appendChild(prefs);
        this._buttonPrefs = prefs;

        var close = document.createElement('div');
        close.className = 'typograf-button typograf-button_close';
        close.innerHTML = '&times;';
        toolbar.appendChild(close);
        this._buttonClose = close;

        var message = document.createElement('div');
        message.className = 'typograf-message';
        toolbar.appendChild(message);
        this._message = message;
        this.messageText('update-bridge');

        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = this._buildCss();
        body.appendChild(style);
        this._style = style;

        body.appendChild(toolbar);
    },
    _initBridge: function() {
        var iframe = document.createElement('iframe');
        iframe.className = 'typograf-iframe';
        iframe.src = this._getIframeUrl();
        body.appendChild(iframe);
        this._iframe = iframe;
    },
    _initEvents: function() {
        var lastInput = null;

        addEvent(this._iframe, 'load', (function() {
            this.messageText('select');
            this._isLoaded = true;
        }).bind(this));

        addEvent(this._buttonClose, 'click', (function() {
            this.destroy();
        }).bind(this));

        addEvent(this._buttonExecute, 'mousedown', (function(e) {
            var sel = this._getSelection();
            if(sel.text) {
                lastInput = sel.el;
                this._iframe.contentWindow.postMessage(JSON.stringify({
                    service: 'typograf',
                    command: 'execute',
                    text: sel.text
                }), '*');
            }

            e.stopPropagation();
            e.preventDefault();
        }).bind(this));

        addEvent(this._buttonExecute, 'mouseup', (function(e) {
            setTimeout(function() {
                if(this._isOk) {
                    this.messageText('ok');
                    this._isOk = false;
                }
            }.bind(this), 1);
        }).bind(this));

        this._onselect = (function(e) {
            this.messageText(this._getSelection().text ? 'selected' : 'select');
        }).bind(this);
        addEvent(document, 'select', this._onselect, true);

        this._onmouseup = (function() {
            if(!this._getSelection().text) {
                this.messageText('select');
            }
        }).bind(this);
        addEvent(document, 'mouseup', this._onmouseup);

        this._onfocus = (function() {
            this._updateIframe();
        }).bind(this);
        addEvent(document, 'focus', this._onfocus);

        this._onmessage = (function(e) {
            var data;

            try {
                data = JSON.parse(e.data);
            } catch(err) {
                return;
            }

            if(data && data.service === 'typograf' && data.command === 'return') {
                this._isOk = true;
                this._paste(lastInput, data.text);
            }
        }).bind(this);
        addEvent(window, 'message', this._onmessage);
    },
    _css: {
        '.typograf-toolbar': {
            position: 'fixed',
            width: '250px',
            height: '55px',
            color: '#000',
            right: '10px',
            top: '10px',
            display: 'block',
            background: 'rgba(255, 255, 255, 0.7)',
            'z-index': '1000000',
            'border-radius': '4px',
            'box-shadow': '0 0 5px rgba(0, 0, 0, 0.2)',
            'font-family': 'Arial, sans-serif'
        },
        '.typograf-button_execute, .typograf-button_prefs': {
            position: 'absolute',
            display: 'block',
            color: 'white',
            cursor: 'pointer',
            top: '5px',
            'text-shadow': '2px 2px 5px rgba(0, 0, 0, 0.4)',
            'border-radius': '4px',
            'font-size': '14px',
            'text-decoration': 'none',
            'user-select': 'none'
        },
        '.typograf-button_execute:hover, .typograf-button_prefs:hover': {
            color: 'white',
            opacity: '0.8'
        },
        '.typograf-button_prefs': {
            padding: '4px 7px',
            left: '142px',
            background: '#00ACC7',
        },
        '.typograf-button_execute': {
            padding: '4px 7px',
            left: '5px',
            background: '#ACC700'
        },
        '.typograf-button_close': {
            position: 'absolute',
            right: '3px',
            top: '0',
            display: 'block',
            color: '#000',
            cursor: 'pointer',
            'font-family': 'Arial, sans-serif',
            'font-size': '16px',
            'text-align': 'center',
            'user-select': 'none'
        },
        '.typograf-message': {
            position: 'absolute',
            left: '5px',
            top: '35px',
            display: 'block',
            color: '#666',
            'font-family': 'Arial, sans-serif',
            'font-size': '12px'
        },
        '.typograf-iframe': {
            position: 'absolute',
            visibility: 'hidden',
            width: '100px',
            height: '100px'
        }
    },
    _buildCss: function() {
        var css = '';

        Object.keys(this._css).forEach(function(rule) {
            css += rule + ' {';

            var ruleObj = this._css[rule];
            Object.keys(ruleObj).forEach(function(prop) {
                css += prop + ': ' + ruleObj[prop] + ' !important;';
            });

            css += '}\n';
        }, this);

        return css;
    }
};

App.init();

function addEvent(elem, type, callback, p) {
    elem.addEventListener(type, callback, p || false);
}

function removeEvent(elem, type, callback, p) {
    elem.removeEventListener(type, callback, p || false);
}

})(window, document);
