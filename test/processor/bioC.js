import { expect } from 'chai';

import { bioC } from '../../src/processor/index.js';
import pubtatorData from '../data/pubtator/index.js';

describe('Processor: bioC', function(){

  describe( 'Pubtator', function(){

    pubtatorData.forEach( bioCJson => {
      let hints;

      before( async () => {
        hints = bioC( bioCJson );
      });

      it('Should have the correct properties', function(){
        const first = hints[0];
        expect( first ).to.have.property('text');
        expect( first ).to.have.property('type');
        expect( first ).to.have.property('xref');
        expect( first ).to.have.nested.property('xref.dbName');
        expect( first ).to.have.nested.property('xref.dbPrefix');
        expect( first ).to.have.nested.property('xref.id');
        expect( first ).to.have.property('section');
      });

    }); // bioC files

  }); // Pubtator

}); // Processor: bioC
