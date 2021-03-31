import { GetStaticProps } from 'next';
import Head from 'next/head';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from "@prismicio/client"
import { useState } from 'react';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [pagination, setPagination] = useState<PostPagination>(postsPagination)

  async function handleLoadMorePosts() {
    await fetch(pagination.next_page)
      .then(response => response.json())
      .then(data => {
        setPagination(data)
        setPosts(posts => [...posts, data.results[0]])
      })
  }
  return (
    <>
      <Header />
      
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main className={commonStyles.container}>
        {posts.map(post =>
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a>
              <section className={styles.content}>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div>
                  <span><FiCalendar />
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}</span>
                  <span><FiUser /> {post.data.author}</span>
                </div>
              </section>
            </a>
          </Link>
        )}
        {pagination.next_page && <button type="button" onClick={handleLoadMorePosts}>Carregar mais posts</button>}
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ], {
    pageSize: 1,
  })

  return {
    props: { postsPagination: postsResponse }
  }
};
