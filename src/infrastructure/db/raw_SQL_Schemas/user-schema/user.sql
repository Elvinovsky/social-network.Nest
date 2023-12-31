PGDMP              	    	    {            social-network    16rc1    16.0 (Homebrew)     &           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            '           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            (           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            )           1262    16398    social-network    DATABASE     r   CREATE DATABASE "social-network" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C';
     DROP DATABASE "social-network";
                postgres    false                        2615    16460    user    SCHEMA        CREATE SCHEMA "user";
    DROP SCHEMA "user";
                postgres    false            �            1259    16467    accountData    TABLE       CREATE TABLE "user"."accountData" (
    login character varying NOT NULL,
    "passwordHash" character varying NOT NULL,
    email character varying NOT NULL,
    "addedAt" timestamp with time zone NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);
 !   DROP TABLE "user"."accountData";
       user         heap    postgres    false    5            �            1259    16492    banInfo    TABLE     �   CREATE TABLE "user"."banInfo" (
    "banDate" timestamp with time zone,
    "banReason" character varying,
    "isBanned" boolean NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "userId" uuid
);
    DROP TABLE "user"."banInfo";
       user         heap    postgres    false    5            �            1259    16477    emailConfirmation    TABLE     �   CREATE TABLE "user"."emailConfirmation" (
    "isConfirmed" boolean NOT NULL,
    "userId" uuid NOT NULL,
    "confirmationCode" uuid,
    "expirationDate" timestamp with time zone,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);
 '   DROP TABLE "user"."emailConfirmation";
       user         heap    postgres    false    5            �           2606    16528    banInfo idBanInfo_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY "user"."banInfo"
    ADD CONSTRAINT "idBanInfo_pkey" PRIMARY KEY (id);
 D   ALTER TABLE ONLY "user"."banInfo" DROP CONSTRAINT "idBanInfo_pkey";
       user            postgres    false    219            �           2606    16526    accountData id_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY "user"."accountData"
    ADD CONSTRAINT id_pkey PRIMARY KEY (id);
 ?   ALTER TABLE ONLY "user"."accountData" DROP CONSTRAINT id_pkey;
       user            postgres    false    217            �           1259    16534 
   fki_userId    INDEX     F   CREATE INDEX "fki_userId" ON "user"."banInfo" USING btree ("userId");
     DROP INDEX "user"."fki_userId";
       user            postgres    false    219            �           2606    16542    banInfo userId    FK CONSTRAINT     �   ALTER TABLE ONLY "user"."banInfo"
    ADD CONSTRAINT "userId" FOREIGN KEY ("userId") REFERENCES "user"."accountData"(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;
 <   ALTER TABLE ONLY "user"."banInfo" DROP CONSTRAINT "userId";
       user          postgres    false    217    3471    219            �           2606    16547    emailConfirmation userId    FK CONSTRAINT     �   ALTER TABLE ONLY "user"."emailConfirmation"
    ADD CONSTRAINT "userId" FOREIGN KEY ("userId") REFERENCES "user"."accountData"(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;
 F   ALTER TABLE ONLY "user"."emailConfirmation" DROP CONSTRAINT "userId";
       user          postgres    false    217    3471    218           