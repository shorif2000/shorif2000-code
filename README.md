# Prerequisites

$ npm -v
5.6.0

webpack -v
3.11.0


node -v
v8.11.1

php -v
PHP 7.0.28-0ubuntu0.16.04.1 (cli) ( NTS )

Ganache CLI v6.0.3

Truffle v3.4.11

available ports are open


# setup

* clone to linux machine
* cd into dir
* start ganache

```sh
ganache-cli
```

* migrate contracts

```sh
truffle migrate --reset
```

* this will provide you with regulator address. make note of this as it is needed
* install react packes with npm

```sh
npm i
```

* build web app

```sh
./node_modules/.bin/webpack
```

* run web service

```sh
php -S 0.0.0.0:8000 -t /home/ubuntu/shorif2000-code/build/
```

# tests

* cd to dir and run
```sh
truffle test
```

* if this does not all run and breaks halfway try a vm on AWS or run test individually

```sh
truffle test test\<filename>
```


# troubleshooting

"sender doesn't have enough funds to send tx. The upfront cost is: 3000000 and the sender's account only has: 0"

restart `ganache-cli` and start again

"out of gas"

start `ganache-cli` with `-l 1000000000`


any other weird or not working problems with revert, try a VM on AWS



