'use strict';
// http://ec2-50-16-64-180.compute-1.amazonaws.com:3001/
export const BACKEND_HOST = 'http://192.168.7.238:3001/';

export const BACKEND = {
    protected_routes: {
        get: {
            posts: BACKEND_HOST + 'auth/get/posts',

        },
        set: {
            posts: BACKEND_HOST + 'auth/add/post',
            images: BACKEND_HOST + 'auth/add/image',

        },
        del: {
            posts: BACKEND_HOST + 'auth/del/post'
        },
    },

    unprotected_routes: {
        get: {
            posts: BACKEND_HOST + 'get/all_posts',
            post: BACKEND_HOST + 'get/post',
            keys: BACKEND_HOST + 'get/postkeys',
            cachekey: BACKEND_HOST + 'get/postcachekey',

        },
        set: {

        },
        del: {

        },
    }

}