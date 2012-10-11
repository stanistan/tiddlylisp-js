# TiddlyLisp in JS

An implimentation of [Lisp as the Maxwell’s equations of software](http://www.michaelnielsen.org/ddi/lisp-as-the-maxwells-equations-of-software/)
in Javascript intead of Python.

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

- Add test coverage in JS (`lisp.core` has tests that run when the repl is initialized)
- A `let` form that is like using `begin` and `define`, but introduces new scope.
- Macro support
- `(load-file)` form to include other files.
- ~~Support for comments: `;`~~
- ~~Add argument destructuring (at least to allow `(lambda (x y & rest) ... )`)~~
- ~~Support for pressing arrow keys in the repl as well as line history~~
- ~~In the repl, don't execute a form if it doesn't have a closing paren, allow multiple line forms.~~
- ~~Add the `'` syntax sugar~~
