import text from './text.js';
import helper from '../helper';
import {parseString} from 'xml2js';

const parser = helper.promisify(parseString, parseString);

export default (ctx, opts) => text(ctx, opts)
    .then(parser)
    .then(data => ({post: data}));
