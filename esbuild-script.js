const esbuild = require('esbuild');
const copyStaticFiles = require('esbuild-copy-static-files');

const config = {
  entryPoints: ['./src/index.web.ts'],
  outdir: './build',
  bundle: true,
  define: {},
  loader: {
    '.wgsl': 'text',
  },
  // plugins
  plugins: [
    copyStaticFiles({
      src: './static',
      dest: './build',
      dereference: true,
      errorOnExist: false,
      recursive: true,
    }),
    replaceNodeBuiltIns(),
  ],
};

const defineProductionFlag = (flag) =>
  (config.define.IS_PRODUCTION = String(flag));

async function buildProd() {
  console.log('Executing prod build');
  defineProductionFlag(true);

  config.minify = true;
  // config.format = 'esm'; // produces invalid build? some module imports or smth. 'type="module"' in <script>?
  config.sourcemap = true;
  config.target = 'chrome100,firefox100,safari15'.split(',');
  await esbuild.build(config);
  console.log(
    `Build finished sucesfully. The files are in '${config.outdir}' directory.`
  );
}

async function startDev() {
  console.log('Starting dev compile process');
  defineProductionFlag(false);

  console.log(`Using entry points:`, config.entryPoints);
  config.logOverride = {
    'empty-import-meta': 'silent', // meshoptimizer.js
  };
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log(`Done. Watching for code changes...`);

  // let { host, port } = await ctx.serve({
  // servedir: 'build',
  // });
  // console.log(`Serve: http://localhost:${port}/`);
}

const isDev = process.argv.some((e) => e == '--dev');
if (isDev) {
  startDev();
} else {
  buildProd();
}

/**
 * 'metis' wants to import 'path', 'fs' at compile time.
 *
 * https://github.com/evanw/esbuild/issues/85#issuecomment-1086620079
 */
function replaceNodeBuiltIns() {
  const dummy = './src/lib/dummy.js';
  const replace = {
    path: require.resolve(dummy),
    fs: require.resolve(dummy),
  };
  const filter = RegExp(`^(${Object.keys(replace).join('|')})$`);
  return {
    name: 'replaceNodeBuiltIns',
    setup(build) {
      build.onResolve({ filter }, (arg) => ({
        path: replace[arg.path],
      }));
    },
  };
}
