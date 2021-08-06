# Charsets in the web

Well, you know _in the beginning was the Word_, but a while after that computers deal with numbers and numbers only, binary-coded within their electronic circuits. That's enough as long as there's no need to show whatever happens with those numbers to a (presumably human) reader; should that need arise, some kind of number-to-character convention must be devised. That's what we call, generally speaking, [character encoding](https://en.wikipedia.org/wiki/Character_encoding); a certain convention of that kind is also called _(a) character encoding_, but for the sake of clarity we'll call it _a charset_ from now on. Just think of it as a set of number-character pairs  -hence that name-.

In the early 2020s, with plenty of storage and compute power available, it's straightforward to think of a single, universal charset for every human being; such thing exists, and it's called [Unicode](https://en.wikipedia.org/wiki/Unicode). But things haven't always been so easy: IT's short history's been one of scarcity dealt with by a frenzy of independently-developed solutions, which has led to an outrageous number of charsets available and _currently in use_. 

Charset management and conversion is therefore a must, and it's a hard task, specially when having data flowing through many interconnected systems using different charsets; e.g.: the web. Systems are usually well designed and deployed and thus charset management usually goes unnoticed to end users; that's fine: IT's only noticed when it's not working, and that's the way it must be. What's astonishing about charset management is that it usually goes unnoticed even by developers and many system admins. Most of them, even experienced ones, are usually unaware of this precise matter happening under the hood, and thus feel at odds when facing encoding issues (*).

Focusing on the web, let's start discussing the simplest web operation one may think of: a browser asking for a static HTML page from a web server. In that scenario:

1. The browser (technically speaking, the _user agent_) will request the page by its URL, stating in the request headers its preferences about _acceptable content_. That's a wide topic, including language preference (english, spanish...), MIME-type preference (HTML, XHTML), content-compression preference and, of course, charset preference. That last one is set by the browser considering the charsets it can understand, the current choice for the client OS (or user session within the client OS) and the browser's ability to convert any of the former into the later.

2. Despite the adjective _acceptable_, the server will take those headers merely as _hints_ in order to choose the most appropiate content (resource) and content-encoding for the response. E.g. the user may prefer spanish content, but if the requested resource is only available in english, well, english it is. Something similar can happen with the response charset: the HTTP server will (usually) try to stick to the user agent's stated preference, but will only do so as long as it's able; and that will be determined by the charset of the requested resource as provided by the underlying OS and the HTTP server's ability to convert that one into the user agent's preferred one. If unable, the server will fall back to a reasonable (and available) choice. Thus, the final, server-decided combination of language, MIME-type, content compression and charset may be very different from that requested, and therefore it must be declared in the response headers for the user agent to know how to parse the data received (don't forget it's just a stream of binary-coded numbers) (**).

The point here: asking for a web page and being able to read it with your eyes requires a lot of common ground and widely available charset-conversion code. When browsing the web, most of the time you fall within that common ground and everything's fine. Sometimes you aren't that lucky and the resource you asked for can only be provided in, e.g., suomi; sometimes you aren't lucky at all and the response can only be served in a charset your browser can't understand, and then you've got some [mojibake](https://en.wikipedia.org/wiki/Mojibake)! (***).

Well, that's the most basic, simplest web operation one can think of. But life ceased to be so easy maybe in the 2000s, today we have:

* The underlying resource may reside in a storage device with a charset different from that of the host server; the server OS must be able to convert that charset into its own default.

* The requested resource may be a dynamic one (CGI script, servlet, PHP page or whatever). Its output may consist of aggregated data from different sources such as databases, disk files or other web services in (possibly) different charsets. The resource-processing code must be able to convert from each into a common one, and then hand it to the HTTP server in a charset it can understand

* The HTTP response may go through a few (reverse and direct) HTTP proxies that may need to change the response charset, either end-to-end of for internal purposes (e.g. cache storage).

So the summary (and the lesson):

* Although unnoticed most of the time, charset-conversion code is ubiquitous in distributed (networked) computing. An interesting –although useless– exercise would be estimating the power consumption of charset conversion worldwide.

* Help yourself by choosing the widely-supported-and-deployed [UTF-8](https://en.wikipedia.org/wiki/UTF-8) as default charset whenever it's possible. And do it at all levels: default for your OS and user sessions, default for your storage, default for your applications' source code, default for your web servers. That eliminates charset-conversion overhead and potential issues at many (often obscure) places.

Notes:

(*) Of course, I wasn't fully aware until I recently faced an odd issue when proxying a Tomcat app (with ISO-8859-1 charset) through an Apache reverse proxy. When proxying HTML content, links must be rewritten to make them coherent accross the proxy (i.e. inner `http://back.end/url` must be rewritten as outer `http://front.end/url`); Apache has a module just for that: [mod_proxy_html](https://httpd.apache.org/docs/2.4/mod/mod_proxy_html.html), which on Linux hosts relies on [libxml2](http://xmlsoft.org/) for XML processing; libxml2's default charset's UTF-8, so proxying our Tomcat app means translating ISO-8859-1 into UTF-8, parsing, rewriting and then translating back into ISO-8859-1. The issue: certain HTML entities (e.g. &uarr;) have an UTF-8 representation, but lack one in ISO-8859-1; thus, the first translation works fine but the second one fails. 

(BTW, cheers to Nick Kew @apache.org for pointing that out, as well as promptly [patching](https://bz.apache.org/bugzilla/show_bug.cgi?id=64443) mod_proxy_html code for a side effect with HTML forms posted accross a charset-converted proxy.) 

Repeating it won't hurt: charset conversion happens everywhere; awareness of it helps tracking down potential issues; avoiding it when possible should be taken as best practice.

(**) For those interested, these are a few interesting readings on the topic:

* [https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation)
* [http://httpd.apache.org/docs/current/en/content-negotiation.html](http://httpd.apache.org/docs/current/en/content-negotiation.html)

(***) Most charsets (maybe everyone of them?) share a common subset for english characters. The alphabets for western languages are usually very similar to that of english, so usually just a small percentage of letters in a non-english text will be shown as "funny characters" in case of a charset-mismatch.

