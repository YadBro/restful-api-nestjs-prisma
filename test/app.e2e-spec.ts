import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { useContainer } from 'class-validator';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const articleShape = expect.objectContaining({
    id: expect.any(Number),
    body: expect.any(String),
    title: expect.any(String),
    published: expect.any(Boolean),
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
  });

  const articlesData = [
    {
      id: 100001,
      title: 'title1',
      description: 'description1',
      body: 'body1',
      published: true,
    },
    {
      id: 100002,
      title: 'title2',
      description: 'description2',
      body: 'body2',
      published: false,
    },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();

    await prisma.article.create({ data: articlesData[0] });
    await prisma.article.create({ data: articlesData[1] });
  });

  // it('/ (GET)', () => {
  //   return request(app.getHttpServer())
  //     .get('/')
  //     .expect(200)
  //     .expect('Hello World!');
  // });

  describe('GET /articles', () => {
    it('returns a list of published articles', async () => {
      const { status, body } = await request(app.getHttpServer()).get(
        '/v1/articles',
      );

      expect(status).toBe(200);
      expect(body).toStrictEqual(expect.arrayContaining([articleShape]));
      expect(body).toHaveLength(1);
      expect(body[0].id).toEqual(articlesData[0].id);
      expect(body[0].published).toBeTruthy();
    });

    it('returns a list of draft articles', async () => {
      const { status, body } = await request(app.getHttpServer()).get(
        '/v1/articles/drafts',
      );

      expect(status).toBe(200);
      expect(body).toStrictEqual(expect.arrayContaining([articleShape]));
      expect(body).toHaveLength(1);
      expect(body[0].id).toEqual(articlesData[1].id);
      expect(body[0].published).toBeFalsy();
    });

    describe('GET /articles/{id}', () => {
      it('returns a given article', async () => {
        const { status, body } = await request(app.getHttpServer()).get(
          `/v1/articles/${articlesData[0].id}`,
        );

        expect(status).toBe(200);
        expect(body).toStrictEqual(articleShape);
        expect(body.id).toEqual(articlesData[0].id);
      });

      it('fails to return non existing user', async () => {
        const { status, body } = await request(app.getHttpServer()).get(
          `/v1/articles/100`,
        );

        expect(status).toBe(404);
      });

      it('fails to return article with invalid id type', async () => {
        const { status, body } = await request(app.getHttpServer()).get(
          `/v1/articles/string-id`,
        );

        expect(status).toBe(400);
      });
    });

    describe('POST /articles', () => {
      it('creates an article', async () => {
        const beforeCount = await prisma.article.count();

        const { status, body } = await request(app.getHttpServer())
          .post('/v1/articles')
          .send({
            title: 'title3',
            description: 'description3',
            body: 'body3a',
            published: false,
          });

        const afterCount = await prisma.article.count();

        expect(status).toBe(201);
        expect(afterCount - beforeCount).toBe(1);
      });

      it('fails to create article without title', async () => {
        const { status, body } = await request(app.getHttpServer())
          .post('/v1/articles')
          .send({
            description: 'description4',
            body: 'body4',
            published: true,
          });

        expect(status).toBe(400);
      });
    });
  });

  describe('PATCH /articles', () => {
    it('update an article', async () => {
      // const beforeCount = await prisma.article.count();

      const { status, body } = await request(app.getHttpServer())
        .patch('/v1/articles/' + articlesData[0].id)
        .send({
          title: 'title3 update',
        });

      const afterCount = await prisma.article.count();

      expect(status).toBe(200);
      expect(body.title).toBe('title3 update');
      // expect(afterCount - beforeCount).toBe(1);
    });

    it('fails to update article if description is to long', async () => {
      const { status, body } = await request(app.getHttpServer())
        .patch('/v1/articles/' + articlesData[1])
        .send({
          description:
            'description4sadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadescription4sadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadescription4sadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadescription4sadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadescription4sadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadescription4sadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadescription4sadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadescription4sadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadescription4sadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadescription4sadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadescription4sadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadescription4sadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadescription4sadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadescription4sadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadescription4sadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadescription4sadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadescription4sadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        });

      expect(status).toBe(400);
    });

    it('fails to update article if article id doesnt exist', async () => {
      const { status, body } = await request(app.getHttpServer())
        .patch('/v1/articles/' + 5)
        .send({
          title: 'Not Found',
        });

      expect(status).toBe(404);
    });
  });
});
