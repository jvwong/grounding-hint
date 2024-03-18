import _ from 'lodash';

const PASSAGE_TYPES = {
  TITLE: 'title',
  ABSTRACT: 'abstract'
};
const passageTypeSet = new Set( Object.values( PASSAGE_TYPES ) );

// PubTator annotation types originate from tmVar 3.0 concept recognition tool
// https://academic.oup.com/bioinformatics/article/38/18/4449/6651836
const ANNOTATION_TYPES = {
  GENE: 'Gene',
  SPECIES: 'Species',
  CHEMICAL: 'Chemical',
  DISEASE: 'Disease',
  CELL_LINE: 'CellLine',
  // DNA_MUTATION: 'DNAMutation',
  // PROTEIN_MUTATION: 'ProteinMutation',
  // SNP: 'SNP',
  // DNA_ALLELE: 'DNAAllele',
  // PROTEIN_ALLELE: 'ProteinAllele',
  // ACID_CHANGE: 'AcidChange',
  // OTHER_MUTATION: 'OtherMutation'
};
const annotationTypeSet = new Set( Object.values( ANNOTATION_TYPES ) );

/**
 * Map a PubTator BioC Document to a hint
 * @param {*} bioCDocument as defined by [NLM DTD]{@link ftp://ftp.ncbi.nlm.nih.gov/pub/wilbur/BioC-PMC/BioC.dtd}
 * @returns {object} hints a set of hints
 */
function fromBioCDocument(bioCDocument) {
  let hints = [];

  const byXref = annotation => {
    const { infons: { type, identifier }} = annotation;
    return `${type}_${identifier}`;
  }

  const byPassageType = passage => {
    const section = _.get(passage, 'infons.type');
    return passageTypeSet.has(section);
  };

  const byAnnotation = annotation => {
    const isValidType = annotation => {
      const { infons: { type }} = annotation;
      return annotationTypeSet.has( type );
    };
    const hasXref = annotation => {
      const { infons } = annotation;
      return _.has( infons, 'identifier' );
    }
    return isValidType( annotation ) && hasXref( annotation );
  };

  const toHint = annotation => {
    const entityTypes = new Map([
      [ANNOTATION_TYPES.GENE, 'ggp'],
      [ANNOTATION_TYPES.CHEMICAL, 'chemical'],
      [ANNOTATION_TYPES.DISEASE, 'disease'],
      [ANNOTATION_TYPES.CELL_LINE, 'cellLine'],
      [ANNOTATION_TYPES.SPECIES, 'organism']
    ]);
    const dbPrefixes = new Map([
      [ANNOTATION_TYPES.GENE, 'NCBIGene'],
      [ANNOTATION_TYPES.CHEMICAL, 'CHEBI'],
      [ANNOTATION_TYPES.DISEASE, 'mesh'],
      [ANNOTATION_TYPES.CELL_LINE, 'cellosaurus'],
      [ANNOTATION_TYPES.SPECIES, 'taxonomy'],
    ]);
    const dbProviderCode = new Map([
      [ANNOTATION_TYPES.SPECIES, 'ncbi'],
    ]);
    const dbNames = new Map([
      [ANNOTATION_TYPES.GENE, 'NCBI Gene'],
      [ANNOTATION_TYPES.CHEMICAL, 'ChEBI'],
      [ANNOTATION_TYPES.DISEASE, 'MeSH'],
      [ANNOTATION_TYPES.CELL_LINE, 'Cellosaurus'],
      [ANNOTATION_TYPES.SPECIES, 'NCBI Taxonomy'],
    ]);
    const { text, infons: { identifier: id, type } } = annotation;

    return {
      text,
      type: entityTypes.get(type),
      xref: {
        dbName: dbNames.get(type),
        dbPrefix: dbPrefixes.get(type),
        id
      }
    }
  }

  let { passages } = bioCDocument;
  passages = passages.filter( byPassageType );

  for( const passage of passages ){
    let { annotations } = passage;
    const section = passage.infons.type;
    annotations = _.uniqBy( annotations, byXref );
    annotations = _.filter( annotations, byAnnotation );
    annotations.forEach( a => {
      const hint = toHint( a );
      _.set(hint, 'section', section);
      hints.push( hint );
    });
  }
  return hints;
}

export default {
  fromBioCDocument
};