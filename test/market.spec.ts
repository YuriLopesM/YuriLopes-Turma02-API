import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';
import p from 'pactum';
import { SimpleReporter as rep } from '../simple-reporter';

describe('Market testing', () => {
  const baseUrl = 'https://api-desafio-qa.onrender.com/mercado';
  let newMarketId = '';
  let newFruitId = '';

  p.request.setDefaultTimeout(120000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  describe('Basic CRUD', () => {
    it('should return all markets', async () => {
      await p.spec().get(baseUrl).expectStatus(StatusCodes.OK);
    }, 120000);

    it('should create a new market', async () => {
      const companyName = faker.string.alphanumeric(10); // faker.company.name não funciona por algum motivo
      newMarketId = await p
        .spec()
        .post(baseUrl)
        .withJson({
          nome: companyName,
          cnpj: faker.string.alphanumeric(14),
          endereco: 'Rua das Flores'
        })
        .expectStatus(StatusCodes.CREATED)
        .expectBodyContains(
          `Mercado '${companyName}' adicionado com sucesso com todas as subcategorias iniciais vazias!`
        )
        .returns('novoMercado.id');
    }, 120000);

    it('should return the market created before', async () => {
      await p
        .spec()
        // Por causa do erro ao buscar por um ID específico, vamos buscar no getAll
        .get(baseUrl)
        .expectStatus(StatusCodes.OK)
        .expectBodyContains(newMarketId);
    }, 120000);

    it('should update the market created before', async () => {
      const companyName = faker.string.alphanumeric(10); // faker.company.name não funciona por algum motivo
      await p
        .spec()
        .put(`${baseUrl}/${newMarketId}`)
        .withJson({
          nome: companyName,
          cnpj: faker.string.alphanumeric(14),
          endereco: 'Rua das Flores'
        })
        .expectStatus(StatusCodes.OK);
    }, 120000);

    it('should return all products from the market', async () => {
      await p
        .spec()
        .get(`${baseUrl}/${newMarketId}/produtos`)
        .expectStatus(StatusCodes.OK);
    }, 120000);

    it('should return all bakery salty foods', async () => {
      await p
        .spec()
        .get(`${baseUrl}/${newMarketId}/produtos/padaria/salgados`)
        .expectStatus(StatusCodes.OK);
    }, 120000);

    it('should return all bakery sweet foods', async () => {
      await p
        .spec()
        .get(`${baseUrl}/${newMarketId}/produtos/padaria/doces`)
        .expectStatus(StatusCodes.OK);
    }, 120000);

    it('should return add a fruit', async () => {
      const newFruit = faker.food.fruit();
      newFruitId = await p
        .spec()
        .post(`${baseUrl}/${newMarketId}/produtos/hortifruit/frutas`)
        .withJson({
          nome: newFruit,
          value: 5.0
        })
        .expectStatus(StatusCodes.OK)
        .expectBodyContains(newFruit)
        .returns('product_item.id');
    }, 120000);

    it('should return all fruits', async () => {
      await p
        .spec()
        .get(`${baseUrl}/${newMarketId}/produtos/hortifruit/frutas`)
        .expectStatus(StatusCodes.OK);
    }, 120000);

    it('should delete the fruit added before', async () => {
      await p
        .spec()
        .delete(
          `${baseUrl}/${newMarketId}/produtos/hortifruit/frutas/${newFruitId}`
        )
        .expectStatus(StatusCodes.OK);
    });

    it('should delete the market created before', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/${newMarketId}`)
        .expectStatus(StatusCodes.OK);
    }, 120000);
  });
});
