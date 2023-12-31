PGDMP      /        	    	    {            social-network    16rc1    16.0 (Homebrew)     ,           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            -           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            .           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            /           1262    16398    social-network    DATABASE     r   CREATE DATABASE "social-network" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C';
     DROP DATABASE "social-network";
                postgres    false                        2615    16595    features    SCHEMA        CREATE SCHEMA features;
    DROP SCHEMA features;
                postgres    false            �            1259    16603    blogs    TABLE     @  CREATE TABLE features.blogs (
    id uuid NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL,
    "websiteUrl" character varying NOT NULL,
    "isMembership" boolean NOT NULL,
    "userId" uuid,
    "userLogin" character varying,
    "addedAt" timestamp with time zone NOT NULL
);
    DROP TABLE features.blogs;
       features         heap    postgres    false    7            �            1259    16622    comments    TABLE     �   CREATE TABLE features.comments (
    id uuid NOT NULL,
    "postId" uuid NOT NULL,
    content character varying NOT NULL,
    "userId" uuid NOT NULL,
    "addedAt" timestamp with time zone NOT NULL,
    "isBanned" boolean NOT NULL
);
    DROP TABLE features.comments;
       features         heap    postgres    false    7            �            1259    16629    likes    TABLE       CREATE TABLE features.likes (
    status character varying NOT NULL,
    "userId" uuid NOT NULL,
    "postIdOrCommentId" uuid NOT NULL,
    "addedAt" timestamp with time zone NOT NULL,
    "isBanned" boolean NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);
    DROP TABLE features.likes;
       features         heap    postgres    false    7            �            1259    16596    posts    TABLE     /  CREATE TABLE features.posts (
    id uuid NOT NULL,
    title character varying NOT NULL,
    "shortDescription" character varying NOT NULL,
    content character varying NOT NULL,
    "blogId" uuid NOT NULL,
    "blogName" character varying NOT NULL,
    "addedAt" timestamp with time zone NOT NULL
);
    DROP TABLE features.posts;
       features         heap    postgres    false    7            �           2606    16609    blogs blogs_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY features.blogs
    ADD CONSTRAINT blogs_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY features.blogs DROP CONSTRAINT blogs_pkey;
       features            postgres    false    222            �           2606    16628    comments comments_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY features.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id, "postId", "userId");
 B   ALTER TABLE ONLY features.comments DROP CONSTRAINT comments_pkey;
       features            postgres    false    223    223    223            �           2606    16602    posts posts_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY features.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY features.posts DROP CONSTRAINT posts_pkey;
       features            postgres    false    221            �           1259    16621    fki_blogId_fkey    INDEX     I   CREATE INDEX "fki_blogId_fkey" ON features.posts USING btree ("blogId");
 '   DROP INDEX features."fki_blogId_fkey";
       features            postgres    false    221            �           1259    16644    fki_postId_fkey    INDEX     L   CREATE INDEX "fki_postId_fkey" ON features.comments USING btree ("postId");
 '   DROP INDEX features."fki_postId_fkey";
       features            postgres    false    223            �           1259    16615    fki_userId_fkey    INDEX     I   CREATE INDEX "fki_userId_fkey" ON features.blogs USING btree ("userId");
 '   DROP INDEX features."fki_userId_fkey";
       features            postgres    false    222            �           2606    16616    posts blogId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY features.posts
    ADD CONSTRAINT "blogId_fkey" FOREIGN KEY ("blogId") REFERENCES features.blogs(id) NOT VALID;
 ?   ALTER TABLE ONLY features.posts DROP CONSTRAINT "blogId_fkey";
       features          postgres    false    3473    222    221            �           2606    16639    comments postId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY features.comments
    ADD CONSTRAINT "postId_fkey" FOREIGN KEY ("postId") REFERENCES features.posts(id) NOT VALID;
 B   ALTER TABLE ONLY features.comments DROP CONSTRAINT "postId_fkey";
       features          postgres    false    3471    221    223            �           2606    16610    blogs userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY features.blogs
    ADD CONSTRAINT "userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."accountData"(id) NOT VALID;
 ?   ALTER TABLE ONLY features.blogs DROP CONSTRAINT "userId_fkey";
       features          postgres    false    222            �           2606    16634    comments userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY features.comments
    ADD CONSTRAINT "userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."accountData"(id) NOT VALID;
 B   ALTER TABLE ONLY features.comments DROP CONSTRAINT "userId_fkey";
       features          postgres    false    223            �           2606    16645    likes userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY features.likes
    ADD CONSTRAINT "userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."accountData"(id) NOT VALID;
 ?   ALTER TABLE ONLY features.likes DROP CONSTRAINT "userId_fkey";
       features          postgres    false    224           