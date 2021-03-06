import {expect} from 'chai';
import {spec} from 'modules/vertamediaBidAdapter';
import {newBidder} from 'src/adapters/bidderFactory';

const ENDPOINT = '//hb2.vertamedia.com/auction/';

const DISPLAY_REQUEST = {
  'bidder': 'vertamedia',
  'params': {
    'aid': 12345
  },
  'bidderRequestId': '7101db09af0db2',
  'auctionId': '2e41f65424c87c',
  'adUnitCode': 'adunit-code',
  'bidId': '84ab500420319d',
  'sizes': [300, 250]
};

const VIDEO_REQUEST = {
  'bidder': 'vertamedia',
  'mediaTypes': {
    'video': {}
  },
  'params': {
    'aid': 12345
  },
  'bidderRequestId': '7101db09af0db2',
  'auctionId': '2e41f65424c87c',
  'adUnitCode': 'adunit-code',
  'bidId': '84ab500420319d',
  'sizes': [[480, 360], [640, 480]]
};

const SERVER_VIDEO_RESPONSE = {
  'source': {'aid': 12345, 'pubId': 54321},
  'bids': [{
    'vastUrl': 'http://rtb.vertamedia.com/vast/?adid=44F2AEB9BFC881B3',
    'requestId': '2e41f65424c87c',
    'url': '44F2AEB9BFC881B3',
    'creative_id': 342516,
    'cmpId': 342516,
    'height': 480,
    'cur': 'USD',
    'width': 640,
    'cpm': 0.9
  }
  ]
};
const SERVER_DISPLAY_RESPONSE = {
  'source': {'aid': 12345, 'pubId': 54321},
  'bids': [{
    'ad': '<!-- Creative -->',
    'requestId': '2e41f65424c87c',
    'creative_id': 342516,
    'cmpId': 342516,
    'height': 250,
    'cur': 'USD',
    'width': 300,
    'cpm': 0.9
  }]
};

const videoBidderRequest = {
  bidderCode: 'bidderCode',
  bids: [{mediaTypes: {video: {}}, bidId: '2e41f65424c87c'}]
};

const displayBidderRequest = {
  bidderCode: 'bidderCode',
  bids: [{bidId: '2e41f65424c87c'}]
};

const videoEqResponse = [{
  vastUrl: 'http://rtb.vertamedia.com/vast/?adid=44F2AEB9BFC881B3',
  requestId: '2e41f65424c87c',
  creativeId: 342516,
  mediaType: 'video',
  netRevenue: true,
  currency: 'USD',
  height: 480,
  width: 640,
  ttl: 3600,
  cpm: 0.9
}];

const displayEqResponse = [{
  requestId: '2e41f65424c87c',
  creativeId: 342516,
  mediaType: 'display',
  netRevenue: true,
  currency: 'USD',
  ad: '<!-- Creative -->',
  height: 250,
  width: 300,
  ttl: 3600,
  cpm: 0.9
}];

describe('vertamediaBidAdapter', () => {
  const adapter = newBidder(spec);

  describe('inherited functions', () => {
    it('exists and is a function', () => {
      expect(adapter.callBids).to.exist.and.to.be.a('function');
    });
  });

  describe('isBidRequestValid', () => {
    it('should return true when required params found', () => {
      expect(spec.isBidRequestValid(VIDEO_REQUEST)).to.equal(12345);
    });

    it('should return false when required params are not passed', () => {
      let bid = Object.assign({}, VIDEO_REQUEST);
      delete bid.params;
      expect(spec.isBidRequestValid(bid)).to.equal(undefined);
    });
  });

  describe('buildRequests', () => {
    let videoBidRequests = [VIDEO_REQUEST];
    let dispalyBidRequests = [DISPLAY_REQUEST];

    const displayRequest = spec.buildRequests(dispalyBidRequests, {});
    const videoRequest = spec.buildRequests(videoBidRequests, {});

    it('sends bid request to ENDPOINT via GET', () => {
      expect(videoRequest[0].method).to.equal('GET');
      expect(displayRequest[0].method).to.equal('GET');
    });

    it('sends bid request to correct ENDPOINT', () => {
      expect(videoRequest[0].url).to.equal(ENDPOINT);
      expect(displayRequest[0].url).to.equal(ENDPOINT);
    });

    it('sends correct video bid parameters', () => {
      const bid = Object.assign({}, videoRequest[0].data);
      delete bid.domain;

      const eq = {
        callbackId: '84ab500420319d',
        ad_type: 'video',
        aid: 12345,
        sizes: '480x360,640x480'
      };

      expect(bid).to.deep.equal(eq);
    });

    it('sends correct display bid parameters', () => {
      const bid = Object.assign({}, displayRequest[0].data);
      delete bid.domain;

      const eq = {
        callbackId: '84ab500420319d',
        ad_type: 'display',
        aid: 12345,
        sizes: '300x250'
      };

      expect(bid).to.deep.equal(eq);
    });
  });

  describe('interpretResponse', () => {
    let serverResponse;
    let bidderRequest;
    let eqResponse;

    afterEach(() => {
      serverResponse = null;
      bidderRequest = null;
      eqResponse = null;
    });

    it('should get correct video bid response', () => {
      serverResponse = SERVER_VIDEO_RESPONSE;
      bidderRequest = videoBidderRequest;
      eqResponse = videoEqResponse;

      bidServerResponseCheck();
    });

    it('should get correct display bid response', () => {
      serverResponse = SERVER_DISPLAY_RESPONSE;
      bidderRequest = displayBidderRequest;
      eqResponse = displayEqResponse;

      bidServerResponseCheck();
    });

    function bidServerResponseCheck() {
      const result = spec.interpretResponse({body: serverResponse}, {bidderRequest});

      expect(result).to.deep.equal(eqResponse);
    }

    function nobidServerResponseCheck() {
      const noBidServerResponse = {bids: []};
      const noBidResult = spec.interpretResponse({body: noBidServerResponse}, {bidderRequest});

      expect(noBidResult.length).to.equal(0);
    }

    it('handles video nobid responses', () => {
      bidderRequest = videoBidderRequest;

      nobidServerResponseCheck();
    });

    it('handles display nobid responses', () => {
      bidderRequest = displayBidderRequest;

      nobidServerResponseCheck();
    });
  });
});
