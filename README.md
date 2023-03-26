# Nest OAuth: Express Local OAuth REST API

## Intro

This is the source code for the
tutorial [Nest Authentication with OAuth2.0](https://dev.to/tugascript/nestjs-authentication-with-oauth20-apollo-local-oauth-graphql-api-5efk).
This is the 4<sup>th</sup> part on a 5 part series, where we will build a production level NestJS OAuth2 service.

However unlike the other parts this one is not production ready. **OAUTH SYSTEMS SHOULD NOT BE IN GRAPHQL**. This is
just for educational purposes, please use the Express REST or Fastify REST APIs. There is nothing wrong with having a
Hybrid API, with REST for Authentication and GraphQL for the rest of the API, that is what is recommended.

### Contents

This contains the code for an express based REST Authentication API.

## Local Setup

1. Install the dependencies:
    ```bash
    $ yarn install
    ```
2. Create a .env file with all the fields equal to the [example](.env.example).
3. Run the app in development mode:
    ```bash
    $ yarn start:dev
    ```

## Testing

**All Unit tests:**

```bash
$ yarn test
```

**Individual Unit test:**

```bash
$ yarn test service-name.service.spec.ts
 ```

**Coverage:**

```bash
$ yarn test:cov
```

**E2E tests:**

```bash
$ yarn test:e2e
```

## About the Author

Hi there, I am Afonso Barracha, an econometrician turned back-end developer with an interest in GraphQL. I try to
publish high-quality articles once or twice a month. If you liked what you saw, to stay updated, follow me
on [dev](https://dev.to/tugascript) and [LinkedIn](https://www.linkedin.com/in/afonso-barracha/) to join our growing
community.

While you at it consider [buying me a coffee](https://www.buymeacoffee.com/barracha), it will help me keep writing.

## License

The code of this tutorial is licensed under the GNU LGPLv3 - see the [LICENSE](LICENSE) file for details.