import { expect } from 'chai';
import _ from 'lodash';

import { pubtator } from '../../src/processor/index.js';
import pubtatorData from '../data/pubtator/index.js';

describe('Processor: Pubtator', function(){

  pubtatorData.forEach( bioCJson => {
    const { infons: { doi } } = bioCJson;

    describe(`Hints from BioC Document ${doi}`, function(){
      let hints;

      before( () => {
        hints = pubtator.fromBioCDocument( bioCJson );
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

      it('Should have valid section', function(){
        const isValidSection = ({ section }) => section === 'title' || section === 'abstract';
        expect( hints.every( isValidSection ) ).to.be.true;
      });

      it('Should be unique to each section', function(){
        const byXref = ({ xref }) => `${xref.dbPrefix}_${xref.id}`;
        const inTitle = _.filter(hints, ['section', 'title']);
        const uniqInTitle = _.uniqBy( inTitle, byXref );
        const inAbstract = _.filter(hints, ['section', 'abstract']);
        const uniqInAbstract = _.uniqBy( inAbstract, byXref );
        expect( inTitle.length ).to.equal( uniqInTitle.length );
        expect( inAbstract.length ).to.equal( uniqInAbstract.length );
      });

    }); // Hints

  }); // bioC JSON data

}); // Pubtator
