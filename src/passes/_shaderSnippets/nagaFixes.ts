import { IS_WGPU } from '../../constants.ts';
import { createArray } from '../../utils/index.ts';

/** If you create a const array e.g. `const COLORS = array<vec3f, COLOR_COUNT>(...);`,
 * Naga only allows consts indices. E.g. `COLORS[0]`, but no `COLORS[i]`. Fix this
 * by creating a giant `switch()`. Hope you did not execute this code in a render loop!
 */
export const nagaFixIndexIntoConstArray = (
  arrayVarName: string,
  arrayLen: number,
  idxExpr: string,
  exprFn: (x: string) => string
) => {
  const createCaseStmt = (_: unknown, i: number) => {
    const arrayVal = `${arrayVarName}[${i}u]`;
    const defaultSt = i == 0 ? ', default' : '';
    return /* wgsl */ `case ${i}u ${defaultSt}: { ${exprFn(arrayVal)} }`;
  };

  return /* wgsl */ `
  switch (${idxExpr}) {
      ${createArray(arrayLen).map(createCaseStmt).join('\n')}
  }`;
};

/**
 * Example:
 *
 * `assignValueFromConstArray(
 *   'color: vec3f', 'COLORS', 14, 'idx % COLOR_COUNT'
 *  )`
 */
export const assignValueFromConstArray = (
  newVarDecl: string,
  arrayVarName: string,
  arrayLen: number,
  idxExpr: string
) => {
  const [varName, varType] = newVarDecl.split(':').map((x) => x?.trim());
  if (varName == undefined || varType == undefined) {
    throw new Error(`assignValueFromConstArray expected newVarDecl param to include variable name and type e.g. 'normal: vec3f'. Got '${newVarDecl}', where name='${varName}', type=${varType}`); // prettier-ignore
  }

  if (!IS_WGPU) {
    return `let ${newVarDecl} = ${arrayVarName}[${idxExpr}];`;
  }

  const switchStmt = nagaFixIndexIntoConstArray(
    arrayVarName,
    arrayLen,
    idxExpr,
    (x) => `${varName} = ${x};`
  );
  return `var ${newVarDecl};
  ${switchStmt}`;
};
