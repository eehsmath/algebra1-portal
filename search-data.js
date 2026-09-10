/* =====================================================================
   EEHS Algebra 1 Portal — search index (search-data.js)
   ---------------------------------------------------------------------
   A static, hand-maintained index of every practice MODULE (the SEs
   inside each standard's practice page — e.g. A.12C "Identify Terms of
   a Sequence") so students can search by topic ("sequence", "linear",
   "function") and jump straight to the right practice page.

   This is intentionally SEPARATE from portal.js's REGISTRY. REGISTRY's
   `modules` field is just a flat array of id strings used as progress-
   tracking storage keys (Portal.record('A.2A', ...)) and must keep that
   exact shape — practice apps and the report depend on it. This file
   only adds searchable metadata; it never changes progress tracking.

   Each standard here should mirror REGISTRY in portal.js (same `code`,
   `sec`, `file`). Each module's `short`/`title`/`blurb` is copied from
   that module's own entry inside its practice app's SES[] array — if a
   teacher edits a module's title/blurb in the app file, update the
   matching entry here too so search stays accurate.

   To add a new standard/module to search: copy one of the blocks below,
   same shape. Nothing else in the site needs to change for search to
   pick it up.
   ===================================================================== */
var SEARCH_INDEX = [

  /* --- Section 1 · Linear functions, equations, and inequalities --- */
  { code: 'A.2', sec: 'linear', file: 'apps/teks-a2.html',
    name: 'Write and represent linear equations, inequalities, and systems of equations.',
    modules: [
      { id: 'A.2A', letter: 'A', short: 'Domain & Range', title: 'Domain & Range from Graphs',
        blurb: 'Determine the domain and range of a linear function in mathematical problems; determine reasonable domain and range values for real-world situations, both continuous and discrete; and represent domain and range using inequalities.' },
      { id: 'A.2B', letter: 'B', short: 'Point & Slope', title: 'Write Equations from Points & Slope',
        blurb: 'Write linear equations in two variables in various forms, including y = mx + b, Ax + By = C, and y − y₁ = m(x − x₁), given one point and the slope and given two points.' },
      { id: 'A.2C', letter: 'C', short: 'Graph · Table · Words', title: 'Write Equations from Graphs, Tables & Descriptions',
        blurb: 'Write linear equations in two variables given a table of values, a graph, and a verbal description.' },
      { id: 'A.2D', letter: 'D', short: 'Direct Variation', title: 'Direct Variation',
        blurb: 'Write and solve equations involving direct variation.' },
      { id: 'A.2E', letter: 'E', short: 'Parallel Line', title: 'Parallel Through a Point',
        blurb: 'Write the equation of a line that contains a given point and is parallel to a given line.' },
      { id: 'A.2F', letter: 'F', short: 'Perpendicular Line', title: 'Perpendicular Through a Point',
        blurb: 'Write the equation of a line that contains a given point and is perpendicular to a given line.' },
      { id: 'A.2G', letter: 'G', short: 'Axis Lines', title: 'Lines Parallel / Perpendicular to the Axes',
        blurb: 'Write an equation of a line that is parallel or perpendicular to the x-axis or y-axis and determine whether the slope of the line is zero or undefined.' },
      { id: 'A.2H', letter: 'H', short: 'Inequalities', title: 'Write Linear Inequalities',
        blurb: 'Write linear inequalities in two variables given a table of values, a graph, and a verbal description.' },
      { id: 'A.2I', letter: 'I', short: 'Systems', title: 'Write Systems of Equations',
        blurb: 'Write systems of two linear equations given a table of values, a graph, and a verbal description.' }
    ] },

  { code: 'A.3', sec: 'linear', file: 'apps/teks-a3.html',
    name: 'Use graphs of linear functions, key features, and related transformations to represent and solve equations, inequalities, and systems of equations.',
    modules: [
      { id: 'A.3A', letter: 'A', short: 'Slope', title: 'Determine the Slope of a Line',
        blurb: 'Determine the slope of a line given a table of values, a graph, two points on the line, and an equation written in various forms, including y = mx + b, Ax + By = C, and y − y₁ = m(x − x₁).' },
      { id: 'A.3B', letter: 'B', short: 'Rate of Change', title: 'Rate of Change in Context',
        blurb: 'Calculate the rate of change of a linear function represented tabularly, graphically, or algebraically in context of mathematical and real-world problems.' },
      { id: 'A.3C', letter: 'C', short: 'Key Features', title: 'Graph & Identify Key Features',
        blurb: 'Graph linear functions on the coordinate plane and identify key features, including x-intercept, y-intercept, zeros, and slope, in mathematical and real-world problems.' },
      { id: 'A.3D', letter: 'D', short: 'Graph Inequality', title: 'Graph a Linear Inequality',
        blurb: 'Graph the solution set of linear inequalities in two variables on the coordinate plane.' },
      { id: 'A.3E', letter: 'E', short: 'Transformations', title: 'Transform the Parent Function f(x) = x',
        blurb: 'Determine the effects on the graph of the parent function f(x) = x when f(x) is replaced by af(x), f(x) + d, f(x − c), and f(bx) for specific values of a, b, c, and d.' },
      { id: 'A.3F', letter: 'F', short: 'Solve Systems', title: 'Graph Systems of Equations',
        blurb: 'Graph systems of two linear equations in two variables on the coordinate plane and determine the solutions if they exist.' },
      { id: 'A.3G', letter: 'G', short: 'Estimate Systems', title: 'Estimate System Solutions (Real-World)',
        blurb: 'Estimate graphically the solutions to systems of two linear equations with two variables in real-world problems.' },
      { id: 'A.3H', letter: 'H', short: 'Systems of Inequalities', title: 'Graph Systems of Inequalities',
        blurb: 'Graph the solution set of systems of two linear inequalities in two variables on the coordinate plane.' }
    ] },

  { code: 'A.4', sec: 'linear', file: 'apps/teks-a4.html',
    name: 'Formulate statistical relationships and evaluate their reasonableness based on real-world data.',
    modules: [
      { id: 'A.4A', letter: 'A', short: 'Correlation r', title: 'Correlation Coefficient (r)',
        blurb: 'Calculate, using technology, the correlation coefficient between two quantitative variables and interpret this quantity as a measure of the strength of the linear association.' },
      { id: 'A.4B', letter: 'B', short: 'Assoc. vs Cause', title: 'Association vs. Causation',
        blurb: 'Compare and contrast association and causation in real-world problems.' },
      { id: 'A.4C', letter: 'C', short: 'Fit & Predict', title: 'Line of Best Fit · Predictions',
        blurb: 'Write, with and without technology, linear functions that provide a reasonable fit to data to estimate solutions and make predictions for real-world problems.' }
    ] },

  { code: 'A.5', sec: 'linear', file: 'apps/teks-a5.html',
    name: 'Solve linear equations and evaluate the reasonableness of their solutions.',
    modules: [
      { id: 'A.5A', letter: 'A', short: 'Equations', title: 'Solve Linear Equations in One Variable',
        blurb: 'Solve linear equations in one variable, including those needing the distributive property and variables on both sides.' },
      { id: 'A.5B', letter: 'B', short: 'Inequalities', title: 'Solve Linear Inequalities in One Variable',
        blurb: 'Solve linear inequalities in one variable, including those needing the distributive property and variables on both sides.' },
      { id: 'A.5C', letter: 'C', short: 'Systems', title: 'Solve Systems of Two Linear Equations',
        blurb: 'Solve systems of two linear equations with two variables for mathematical and real-world problems.' }
    ] },

  /* --- Section 2 · Quadratic functions and equations --- */
  { code: 'A.6', sec: 'quadratic', file: 'apps/teks-a6.html',
    name: 'Write and represent quadratic equations.',
    modules: [
      { id: 'A.6A', letter: 'A', short: 'Domain & Range', title: 'Domain & Range from Graphs',
        blurb: 'Determine the domain and range of quadratic functions represented as graphs — full parabolas, segments, and rays — and represent the domain and range using inequalities.' },
      { id: 'A.6B', letter: 'B', short: 'Write / Convert', title: 'Write Quadratics in Vertex & Standard Form',
        blurb: 'Write a quadratic in vertex form f(x) = a(x − h)² + k from a vertex and a point, and rewrite vertex form as standard form.' },
      { id: 'A.6C', letter: 'C', short: 'From Solutions', title: 'Write Quadratics from Solutions & Graphs',
        blurb: 'Write a quadratic function given its real solutions or the graph of its related equation.' }
    ] },

  { code: 'A.7', sec: 'quadratic', file: 'apps/teks-a7.html',
    name: 'Use graphs of quadratic functions and their related transformations to represent and determine the solutions to equations.',
    modules: [
      { id: 'A.7A', letter: 'A', short: 'Key features', title: 'Graph & Identify Key Attributes',
        blurb: 'Graph a quadratic function and read its intercepts, zeros, vertex, axis of symmetry, and max/min from the graph.' },
      { id: 'A.7B', letter: 'B', short: 'Factors & zeros', title: 'Linear Factors & Zeros',
        blurb: 'Connect the linear factors of a quadratic to the zeros of its function: each factor (x − r) gives a zero at x = r.' },
      { id: 'A.7C', letter: 'C', short: 'Transformations', title: 'Transformations of f(x) = x²',
        blurb: 'Describe and write transformations of the parent function using af(x), f(x) + d, f(x − c), and f(bx).' }
    ] },

  { code: 'A.8', sec: 'quadratic', file: 'apps/teks-a8.html',
    name: 'Solve quadratic equations and evaluate the reasonableness of their solutions.',
    modules: [
      { id: 'A.8A', letter: 'A', short: 'Solve Quad.', title: 'Solve Quadratic Equations',
        blurb: 'Solve quadratic equations having real solutions by factoring, taking square roots, completing the square, and applying the quadratic formula.' },
      { id: 'A.8B', letter: 'B', short: 'Model Data', title: 'Model Data with Quadratic Functions',
        blurb: 'Write, using technology, quadratic functions that provide a reasonable fit to data to estimate solutions and make predictions for real-world problems.' }
    ] },

  /* --- Section 3 · Exponential functions and equations --- */
  { code: 'A.9', sec: 'exponential', file: 'apps/teks-a9.html',
    name: 'Write, graph, and represent exponential equations and evaluate the reasonableness of their solutions.',
    modules: [
      { id: 'A.9A', letter: 'A', short: 'Domain/Range', title: 'Domain & Range of Exponential Functions',
        blurb: 'Determine the domain and range of exponential functions of the form f(x) = abˣ and represent the domain and range using inequalities.' },
      { id: 'A.9B', letter: 'B', short: 'Interpret a, b', title: 'Interpreting a and b',
        blurb: 'Interpret the meaning of the values of a and b in exponential functions of the form f(x) = abˣ in real-world problems.' },
      { id: 'A.9C', letter: 'C', short: 'Write Model', title: 'Write Exponential Models',
        blurb: 'Write exponential functions in the form f(x) = abˣ (where b is a rational number) to describe problems arising from mathematical and real-world situations, including growth and decay.' },
      { id: 'A.9D', letter: 'D', short: 'Graph Features', title: 'Graph Key Features',
        blurb: 'Graph exponential functions that model growth and decay and identify key features, including y-intercept and asymptote, in mathematical and real-world problems.' },
      { id: 'A.9E', letter: 'E', short: 'Model Data', title: 'Model Data with Exponential Functions',
        blurb: 'Write, using technology, exponential functions that provide a reasonable fit to data and make predictions for real-world problems.' }
    ] },

  /* --- Section 4 · Number and algebraic methods --- */
  { code: 'A.10', sec: 'methods', file: 'apps/teks-a10.html',
    name: 'Rewrite in equivalent forms and perform operations on polynomial expressions.',
    modules: [
      { id: 'A.10A', letter: 'A', short: 'Add/Subtract', title: 'Add and Subtract Polynomials',
        blurb: 'Add and subtract polynomials of degree one and degree two.' },
      { id: 'A.10B', letter: 'B', short: 'Multiply', title: 'Multiply Polynomials',
        blurb: 'Multiply polynomials of degree one and degree two.' },
      { id: 'A.10C', letter: 'C', short: 'Divide', title: 'Divide Polynomials',
        blurb: 'Determine the quotient of a polynomial of degree one and a polynomial of degree two when divided by a polynomial of degree one or degree two, where the divisor’s degree does not exceed the dividend’s.' },
      { id: 'A.10D', letter: 'D', short: 'Distribute', title: 'Use the Distributive Property',
        blurb: 'Rewrite polynomial expressions of degree one and degree two in equivalent forms using the distributive property.' },
      { id: 'A.10E', letter: 'E', short: 'Factor Trinomials', title: 'Factor Trinomials',
        blurb: 'Factor, if possible, trinomials with real factors in the form ax² + bx + c, including perfect square trinomials of degree two.' },
      { id: 'A.10F', letter: 'F', short: 'Diff. of Squares', title: 'Difference of Two Squares',
        blurb: 'Decide if a binomial can be written as the difference of two squares and, if possible, use that structure to rewrite the binomial.' }
    ] },

  { code: 'A.11', sec: 'methods', file: 'apps/teks-a11.html',
    name: 'Rewrite algebraic expressions into equivalent forms.',
    modules: [
      { id: 'A.11A', letter: 'A', short: 'Simplify Radicals', title: 'Simplify Radical Expressions',
        blurb: 'Simplify numerical radical expressions involving square roots.' },
      { id: 'A.11B', letter: 'B', short: 'Laws of Exponents', title: 'Laws of Exponents',
        blurb: 'Simplify numeric and algebraic expressions using the laws of exponents, including integral and rational exponents.' }
    ] },

  { code: 'A.12', sec: 'methods', file: 'apps/teks-a12.html',
    name: 'Write, solve, analyze, and evaluate equations, relations, and functions.',
    modules: [
      { id: 'A.12A', letter: 'A', short: 'Is It a Function?', title: 'Is It a Function?',
        blurb: 'Decide whether relations represented as mapping diagrams, tables, graphs, and equations define a function.' },
      { id: 'A.12B', letter: 'B', short: 'Evaluate Functions', title: 'Evaluate Functions',
        blurb: 'Evaluate functions, expressed in function notation, given one or more elements in their domains.' },
      { id: 'A.12C', letter: 'C', short: 'Sequence Terms', title: 'Identify Terms of a Sequence',
        blurb: 'Identify terms of arithmetic and geometric sequences when the sequences are given in function form using recursive processes.' },
      { id: 'A.12D', letter: 'D', short: 'nth-Term Formula', title: 'Write the nth-Term Formula',
        blurb: 'Write a formula for the nth term of arithmetic and geometric sequences, given the value of several of their terms.' },
      { id: 'A.12E', letter: 'E', short: 'Literal Equations', title: 'Solve Literal Equations',
        blurb: 'Solve mathematic and scientific formulas, and other literal equations, for a specified variable.' }
    ] }
];
