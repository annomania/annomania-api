# Annomania
[![Build Status](https://travis-ci.org/annomania/annomania-api.svg?branch=master)](https://travis-ci.org/annomania/annomania-api)

Annotating tool for sentiment analysis

## Getting Started
### Setup
To get the project running first it is required to have
* Docker (including docker-compose)

setup on your system.

After that clone the project, then ```cd``` into that directory and run
```
docker-compose up
```

Now you're ready to go. You can start the development server as described below.
Notice that it is required to prefix every command you want to run in
the servers context with ```docker-compose run api {command}```.

### Development

#### Start development server
To start the development server run
```
make
```

You can open the page now on http://localhost:3000/

#### Running tests
Use the following commands to run the tests
```
make test          # without coverage

make coverage      # with code coverage
```

#### Check code style with linting
Use the following command to run ```eslint```
```
make lint
```

#### Pre-Commit Check
There is a shortcut to run lint and the tests together as a pre-commit check.
If the commands end without an error, it is most likely that the change will
pass CI.

```
make check
```

## Swagger
Swagger is linked to the api docker container and starts with the development server. Swagger-ui with the documentation is availabe at http://localhost:8080 (served from http://localhost:3000/api-docs/swagger.yaml).

## Code Style
We make use of eslint to ensure a consistent code style throughout the project.
We write the code in an ES2015+ style  and we prefer the use
of classes and the ```import``` statement.
We follow the Airbnb javascript style guidelines: https://github.com/airbnb/javascript.

## Docstyle
We use JSDoc (http://usejsdoc.org) to document code. Preferably no inline comments should be necessary.
Docstrings should only be added if they add information and not just to include them.

## Branching Policy
We create a single branch for each feature, bugfix and setup task as we implement.
Examples of branch names: ```feature/user-login```, ```bugfix/api-token-generation```, ```setup/integrate-angularjs```

**Important** is that we **always** branch away from the ```development``` branch. The branches are then merged back via pull-requests. Here it's very important to target the pull-request against the ```development``` branch.
