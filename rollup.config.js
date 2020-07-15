import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript';
import pkg from './package.json';

export default [

    //
    // DEV BUNDLE
    //

    {
        input: 'src/main.ts',
        output: {
            name: 'UniqueShortId',
            file: 'public/unique-short-id.js',
            format: 'iife', // immediately-invoked function expression — suitable for <script> tags
            sourcemap: true
        },
        plugins: [
            typescript(),
            resolve(),
            commonjs()
        ]
    },

    //
    // PROD BUNDLE
    //

    {
        input: 'src/main.ts',
        output: {
            name: 'UniqueShortId',
            file: 'dist/unique-short-id.umd.js',
            format: 'umd',
            sourcemap: true,
            compact: true
        },
        external: [
            'seedrandom'
        ],
        plugins: [
            typescript(),
            resolve(),
            commonjs(),
            terser({
                ecma: 5
            }),
            filesize()
        ]
    },
    {
        input: 'src/main.ts',
        output: {
            name: 'UniqueShortId',
            file: 'dist/unique-short-id.all.umd.js',
            format: 'umd',
            sourcemap: true,
            compact: true
        },
        plugins: [
            typescript(),
            resolve(),
            commonjs(),
            terser({
                ecma: 5
            }),
            filesize()
        ]
    },
    {
        input: 'src/main.ts',
        external: [
            'seedrandom'
        ],
        output: [
            {
                file: pkg.main,
                sourcemap: true,
                compact: true,
                format: 'cjs'
            },
            {
                file: pkg.module,
                sourcemap: true,
                compact: true,
                format: 'es'
            }
        ],
        plugins: [
            typescript(),
            terser({
                ecma: 5
            }),
            filesize()
        ]
    }

];
