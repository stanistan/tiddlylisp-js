# TiddlyLisp in JS [![Build Status](https://secure.travis-ci.org/stanistan/tiddlylisp-js.png)](http://travis-ci.org/stanistan/tiddlylisp-js)

An implimentation of [Lisp as the Maxwell’s equations of software](http://www.michaelnielsen.org/ddi/lisp-as-the-maxwells-equations-of-software/)
in Javascript intead of Python.

## Current Issue

Macros using backtick are being evaluated outside of the scope of definition.

So in this scenario:

```lisp
(defmacro 'test
  (lambda (x y)
    `(,+ ,y ,x)))

(t 1 2)
; => error: x is undefined
```

It looks like the macro function itself is returning the form and the `,` is evaluated
afterwards.

## Usage

In git directory.

##### Open REPL

```
node main.js
```

##### Open REPL with loaded file(s)

```
node main.js /path/to/file1 /path/to/file2
```

## Still needs to be done

- working symbols for backquote, splice, and eval

#### Things that are done (ish)

- ~~Macro support~~
- ~~A `let` form that is like using `begin` and `define`, but introduces new scope.~~
- ~~`(load-file)` form to include other files.~~
- ~~Add test coverage in JS (`lisp.core` has tests that run when the repl is initialized)~~
- ~~Support for comments: `;`~~
- ~~Add argument destructuring (at least to allow `(lambda (x y & rest) ... )`)~~
- ~~Support for pressing arrow keys in the repl as well as line history~~
- ~~In the repl, don't execute a form if it doesn't have a closing paren, allow multiple line forms.~~
- ~~Add the `'` syntax sugar~~
