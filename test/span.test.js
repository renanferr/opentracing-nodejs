const { serviceName, serverUrl, secretToken, tracer } = require('./util/singleton')
const expect = require('chai').expect
const { Span } = require('../lib')

describe("Span", () => {
  it("should have provided name", done => {
    const name = 'my-span-name'
    const s = tracer.startSpan(name)
    expect(s).to.be.instanceOf(Span)
    expect(s).to.haveOwnProperty('name')
    expect(s.name).to.equal(name)
    s.finish()
    done()
  })

  it("should sanitize error message string to error object", done => {
    const str = "Error message"
    const s = tracer.startSpan('test-span')
    const sanitized = s._sanitizeError(str)
    expect(sanitized).to.be.instanceOf(Error)
    expect(sanitized.message).to.equal(str)
    s.finish()
    done()
  })

  it("should set provided tag to span with setTag", done => {
    const tagName = 'tag'
    const tagValue = 'val'
    const s = tracer.startSpan('test-span')
    s.setTag(tagName, tagValue)
    expect(s._span._span._labels[tagName]).to.equal(tagValue)
    done()
  })


  it("should set provided tag to span with addTag", done => {
    const tagName = 'tag'
    const tagValue = 'val'
    const s = tracer.startSpan('test-span')
    s.addTag(tagName, tagValue)
    expect(s._span._span._labels[tagName]).to.equal(tagValue)
    done()
  })

  it("should set provided tag to span with setLabel", done => {
    const tagName = 'tag'
    const tagValue = 'val'
    const s = tracer.startSpan('test-span')
    s.setLabel(tagName, tagValue)
    expect(s._span._span._labels[tagName]).to.equal(tagValue)
    done()
  })

  it("should set provided tags to span with setTags", done => {
    const tags = {
      tag1: '1',
      tag2: '2'
    }

    const s = tracer.startSpan('test-span')
    s.setTags(tags)
    
    Object.entries(tags)
      .forEach(([tag, value]) => {
        expect(s._span._span._labels[tag]).to.equal(value)
      })
    done()
  })


  it("should set provided tags to span with addTags", done => {
    const tags = {
      tag1: '1',
      tag2: '2'
    }

    const s = tracer.startSpan('test-span')
    s.addTags(tags)
    Object.entries(tags)
      .forEach(([tag, value]) => {
        expect(s._span._span._labels[tag]).to.equal(value)
      })
    done()
  })

  it("should set provided tags to span with setLabels", done => {
    const tags = {
      tag1: '1',
      tag2: '2'
    }

    const s = tracer.startSpan('test-span')
    s.setLabels(tags)
    Object.entries(tags)
      .forEach(([tag, value]) => {
        expect(s._span._span._labels[tag]).to.equal(value)
      })
    done()
  })

  it("should return tag value for for getTag", done => {
    const tag = 'tagName'
    const val = 'tagValue'

    const s = tracer.startSpan('test-span')
    s.setTag(tag, val)
    expect(s.getTag(tag)).to.equal(val)
    done()
  })

  it("should return all tags for getTags", done => {
    const tags = {
      tag1: '1',
      tag2: '2'
    }

    const s = tracer.startSpan('test-span')
    s.setTags(tags)
    const retreivedTags = s.getTags()
    expect(retreivedTags).to.deep.equal(tags)
    done()
  })
})
