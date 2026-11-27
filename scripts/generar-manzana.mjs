import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {planificarManzana,recetaDeManzana} from '../src/manzana-plan.js';
const args=process.argv.slice(2),opciones={},permitidos=new Set(['cantidadCasas','semilla','ancho','fondo','lados','angulos','vegetacion','salida']);let salida='entregables/manzana-colonial/receta';
try{
 for(let i=0;i<args.length;i+=2){const clave=args[i]?.replace(/^--/,'');if(!permitidos.has(clave)||args[i+1]===undefined)throw new Error('Uso: node scripts/generar-manzana.mjs --cantidadCasas 16 --semilla cuadra-001 --ancho 96 --fondo 96 --vegetacion 0.65 --salida entregables/cuadra-001');const valor=args[i+1];if(clave==='salida')salida=valor;else opciones[clave]=clave==='semilla'?valor:['lados','angulos'].includes(clave)?valor.split(',').map(Number):Number(valor);}
 const plan=planificarManzana(opciones);await mkdir(salida,{recursive:true});await writeFile(join(salida,'receta.json'),JSON.stringify(recetaDeManzana(plan),null,2)+'\n');await writeFile(join(salida,'planta.json'),JSON.stringify(plan,null,2)+'\n');console.log(JSON.stringify({salida:resolve(salida),...plan.estadisticas},null,2));
}catch(e){console.error(e.message);process.exitCode=1;}
