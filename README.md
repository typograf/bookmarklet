Букмарклет для типографа
===========

Позволяет типографировать тексты в полях ввода, находясь непосредственно на самом сайте.

Для этого необходимо создать закладку в браузере и указать у неё адрес:
```js
javascript:(function(d,s){s=d.createElement('script');s.src='https://rawgit.com/typograf/bookmarklet/master/inside.js';d.body.appendChild(s)})(document);
```

При клике на закладку, на сайте должна появиться панель с типографом.

![Panel](https://raw.githubusercontent.com/typograf/bookmarklet/master/test/panel.png)
