# APM Opentracing Node.js
An open-source node.js package to make it easier to trace transitions in your code using Elastic APM and Opentracing specification.


## Instalação
```bash
npm install --save opentracing-nodejs
```

## Uso

#### Importação e inicialização
```javascript
// commonjs modules
const Tracer = require('opentracing-nodejs').Tracer

// commonjs modules w/ object destructuring
const { Tracer } = require('opentracing-nodejs')

// es6 modules
import { Tracer } from 'opentracing-nodejs'
```

O módulo exporta a classe `Tracer` que implementa [as mesmas configurações do agente oficial do Elastic APM para Node.js.](https://www.elastic.co/guide/en/apm/agent/nodejs/master/configuration.html)


```javascript
const { Tracer } = require('opentracing-nodejs')

const tracer = new Tracer({
	serviceName: 'my-node-app',
	secretToken: 'my-apm-secret-token',
	serverUrl: 'my-apm-server-url',
})
```

#### decorate
##### (fn: function[, spanName: string])
A instância `tracer` agora pode "decorar" as funções passadas para seu método `decorate`, retornando uma nova função que se responsabiliza de automaticamente enviar logs de quanto tempo durou a execução da função decorada e/ou de eventuais erros para o servidor APM.

```javascript
function myFunction(textArg) {
	console.log(textArg)
}

const myDecoratedFunction = tracer.decorate(myFunction)

myDecoratedFunction('hello, opentracing!')
// Isso escreve o texto "hello, opentracing!" no terminal normalmente, e, além disso, envia logs de tempo de execução e eventuais erros para o servidor APM.
```

O método `decorate` também aceita, como segundo parâmetro, um nome para o span que será enviado para o servidor APM (por padrão, o nome do span é o nome da própria função que foi decorada).

```javascript
function myFunction(textArg) {
	console.log(textArg)
}
myDecoratedFunction('hello, opentracing!')
// Cria um span com nome "myFunction", que é o nome da função que foi decorada.
```

```javascript
function myFunction(textArg) {
	console.log(textArg)
}

const myDecoratedFunction = tracer.decorate(myFunction, 'my-custom-span-name')
// Cria um span com nome "my-custom-span-name".
```

#### decorateExpress
##### (expressHandler: function[, spanName: string])
O método `decorateExpress` é similar ao `decorate`, mas ao invés de receber como primeiro parâmetro qualquer função, ele recebe diretamente uma *handler function* do express.
Dessa forma, além de manter o controle do tempo de execução e eventuais erros, o *opentracing-nodejs* pode saber qual foi a resposta do servidor em determinada rota, através dos objetos de *Request* e *Response* do *express*, assim, gerando também logs a respeito do *Status Code* da resposta, rota chamada, etc.
```javascript
const express = require('express')
const app = express()
const { Tracer } = require('opentracing-nodejs')

const tracer = new Tracer({
	serviceName: 'my-node-app',
	secretToken: 'my-apm-secret-token',
	serverUrl: 'my-apm-server-url',
})

function myHandlerFunc(req, res, next) {
	return res.status(200).send('OK')
}

// Agora basta decorarmos nossa função handler do express usando o método 'decorateExpress' do Tracer.

const decoratedHandlerFunc = tracer.decorateExpress(myHandlerFunc, 'trace-index-route')
app.get('/', decoratedHandlerFunc)

// Ou somente:
app.get('/', tracer.decorateExpress(myHandlerFunc, 'trace-index-route'))
...
```

##### Decorando Middlewares do Express
Para usar o *opentracing* em middlewares do seu *app* *express*, basta decorá-las como uma função normal:
```javascript
function myHandlerFunc(req, res, next) {
	return res.status(200).json({ status: 'up' })
}

function myMiddlewareFunc(req, res, next) {
	res.set('Content-type', 'application/json;charset=utf-8')
	next()
}

const decoratedHandlerFunc = tracer.decorateExpress(myHandlerFunc, 'trace-index-route')
const decoratedMiddlewareFunc = tracer.decorate(myMiddlewareFunc, 'trace-content-type-middleware')
app.get('/', decoratedMiddlewareFunc, decoratedHandlerFunc)
...
```