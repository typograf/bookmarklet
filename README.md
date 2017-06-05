Букмарклет для типографа
===========

**На данный момент букмарклет устарел, используйте полноценное [дополнение для браузера](https://github.com/typograf/red-typography-webextension).**

Позволяет типографировать тексты в полях ввода, находясь непосредственно на самом сайте.

Для этого необходимо создать закладку в браузере и указать её адрес:
```js
javascript:(function(d,s){s=d.createElement('script');s.src='https://rawgit.com/typograf/bookmarklet/master/inside.js?v='+Date.now();d.body.appendChild(s)})(document);
```

При клике на закладку, на сайте появится панель с типографом. Вводим текст в поле и нажимаем кнопку «Типографировать».

![Panel](https://raw.githubusercontent.com/typograf/bookmarklet/master/test/panel.png)

На сайтах, использующих [CSP](https://developer.mozilla.org/en-US/docs/Web/Security/CSP) (github.com, facebook.com и др.), букмарклет не работает.

