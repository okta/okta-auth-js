import { jsonpath } from '../../../lib/util/jsonpath';

describe('jsonpath', () => {
  it('should throw if vulnerable for RCE (remote code execution)', () => {
	expect(() => {
      jsonpath({
		path: '$..[?(' + '(function a(arr){' + 'a([...arr, ...arr])' + '})([1]);)]',
		json: {
			nonEmpty: 'object',
		},
      });
	}).toThrow();
  });
});
