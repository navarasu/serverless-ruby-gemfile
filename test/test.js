const assert = require('assert');
const path = require('path');
const fs = require('fs-extra');
const { runCommand,readZip } = require('./helper');

let test_data = [
  { folder: 'basic', gem_zip_dirs: ['/','/bin/','/build_info/','/doc/','/extensions/', '/gems/',
    '/specifications/','/gems/httparty/', '/gems/mime-types-data/', '/gems/multi_xml/', '/gems/mime-types/'],
    function_files: ['handler.rb'], include_functions: ['Hello'], exclude_functions:[] },

  { folder: 'use-docker', gem_zip_dirs: [ '/', '/bin/', '/build_info/', '/doc/', '/extensions/', '/gems/', '/plugins/',
    '/specifications/', '/extensions/x86_64-linux/', '/gems/addressable/', '/gems/domain_name/', '/gems/ffi/',
    '/gems/ffi-compiler/', '/gems/http/', '/gems/http-cookie/', '/gems/http-form_data/', '/gems/llhttp-ffi/', 
    '/gems/nokogiri-linux/', '/gems/racc/' ,'/gems/public_suffix/', '/gems/rake/', '/gems/unf/', '/gems/unf_ext/' ],
    function_files: ['handler.rb'], include_functions: ['Hello'], exclude_functions:[] },

  { folder: 'use-docker-with-yums-pg-old', gem_zip_dirs: [ '/', '/build_info/', '/doc/', '/extensions/', '/gems/', '/plugins/',
    '/specifications/', '/gems/pg/', '/extensions/x86_64-linux/', 'lib/', 'lib/libpq.so.5', 'lib/liblber', 'lib/libldap_r',
    'lib/libnss3.so', 'lib/libsasl2.so.3', 'lib/libsmime3.so', 'lib/libssl3.so' ],
    function_files: ['handler.rb'], include_functions: ['Hello'], exclude_functions:[] },

  { folder: 'use-docker-file', gem_zip_dirs: [ '/', '/build_info/', '/doc/', '/extensions/', '/gems/', '/plugins/',
    '/specifications/', '/gems/pg/', '/extensions/x86_64-linux/', 'lib/', 'lib/libpq.so.5', 'lib/liblber', 'lib/libldap_r',
    'lib/libnss3.so', 'lib/libsasl2.so.3', 'lib/libsmime3.so', 'lib/libssl3.so' ],
    function_files: ['handler.rb'], include_functions: ['Hello'], exclude_functions:[] },

  { folder: 'include-functions', gem_zip_dirs: ['/','/bin/','/build_info/','/doc/','/extensions/', '/gems/',
    '/specifications/','/gems/httparty/', '/gems/mime-types-data/', '/gems/multi_xml/', '/gems/mime-types/'],
    function_files: ['handler1.rb', 'handler2.rb', 'handler3.rb'], include_functions: ['Hello1', 'Hello2'],
    exclude_functions: ['Hello3']},

  {folder: 'exclude-functions', gem_zip_dirs: ['/','/bin/','/build_info/','/doc/','/extensions/', '/gems/',
    '/specifications/','/gems/httparty/', '/gems/mime-types-data/', '/gems/multi_xml/', '/gems/mime-types/'],
    function_files: ['handler1.rb', 'handler2.rb', 'handler3.rb'], include_functions: ['Hello1', 'Hello2'],
    exclude_functions: ['Hello3']},

  { folder: 'exclude-dev-test-gems', gem_zip_dirs: ['/','/bin/','/build_info/','/doc/','/extensions/', '/gems/',
    '/specifications/','/gems/httparty/', '/gems/mime-types-data/', '/gems/multi_xml/', '/gems/mime-types/'],
    function_files: ['handler.rb'], include_functions: ['Hello'], exclude_functions:[] },

  { folder: 'basic-with-gemfile-lock', gem_zip_dirs: ['/','/bin/','/build_info/','/doc/','/extensions/', '/gems/',
    '/specifications/','/gems/httparty-0.18.1/', '/gems/mime-types-data-3.2020.1104/', '/gems/multi_xml-0.6.0/', '/gems/mime-types-3.3.1/'],
    function_files: ['Gemfile', 'Gemfile.lock', 'handler.rb'], include_functions: ['Hello'], exclude_functions:[], check_version: true },

  // { folder: 'use-docker-with-gemfile-lock', gem_zip_dirs: ['/','/bin/','/build_info/','/doc/','/extensions/', '/gems/', 
  //   '/plugins/', '/specifications/','/gems/httparty-0.18.1/', '/gems/mime-types-data-3.2020.1104/', '/gems/multi_xml-0.6.0/', '/gems/mime-types-3.3.1/'],
  //   function_files: ['Gemfile', 'Gemfile.lock', 'handler.rb'], include_functions: ['Hello'], exclude_functions:[], check_version: true },

  // { folder: 'basic-ignore-gemfile-lock', gem_zip_dirs: ['/','/bin/','/build_info/','/doc/','/extensions/', '/gems/', 
  //   '/specifications/','/gems/httparty-0.18.1/', '/gems/mime-types-data-3.2021.0225/', '/gems/multi_xml-0.6.0/', '/gems/mime-types-3.3.1/'],
  //   function_files: ['handler.rb'], include_functions: ['Hello'], exclude_functions:[], check_version: true },

  // { folder: 'use-docker-ignore-gemfile-lock', gem_zip_dirs: ['/','/bin/','/build_info/','/doc/','/extensions/', '/plugins/',
  //   '/gems/', '/specifications/','/gems/httparty-0.20.0/', '/gems/mime-types-data-3.2022.0105/', '/gems/multi_xml-0.6.0/', '/gems/mime-types-3.4.1/'],
  //   function_files: ['handler.rb'], include_functions: ['Hello'], exclude_functions:[], check_version: true },

  // { folder: 'bundler-require-all', gem_zip_dirs: ['/','/bin/','/build_info/','/doc/','/extensions/', '/plugins/',
  //   '/gems/', '/specifications/','/gems/httparty-0.18.1/', '/gems/mime-types-data-3.2020.1104/', '/gems/multi_xml-0.6.0/', '/gems/mime-types-3.3.1/',
  //   '/gems/nokogiri-1.11.3-x86_64-linux/', '/gems/racc-1.5.2/', '/extensions/x86_64-linux/', '/gems/mini_portile2-2.5.1/' ],
  //   function_files: ['Gemfile', 'Gemfile.lock', 'handler.rb'], include_functions: ['Hello'], exclude_functions:[], check_version: true },

  // { folder: 'use-docker-with-environment', gem_zip_dirs: ['/','/bin/','/build_info/','/doc/','/extensions/', '/gems/', '/plugins/',
  //   '/specifications/','/extensions/x86_64-linux/','/gems/httparty/', '/gems/mime-types-data/', '/gems/multi_xml/', '/gems/mime-types/', 
  //   '/gems/nokogiri/', '/gems/mini_portile2/'], function_files: ['handler.rb'], include_functions: ['Hello'], exclude_functions:[] },

  // { folder: 'use-docker-file-with-environment', gem_zip_dirs: ['/','/bin/','/build_info/','/doc/','/extensions/', '/gems/', '/plugins/',
  //   '/specifications/','/extensions/x86_64-linux/','/gems/httparty/', '/gems/mime-types-data/', '/gems/multi_xml/', '/gems/mime-types/', 
  //   '/gems/nokogiri/', '/gems/mini_portile2/'], function_files: ['handler.rb'], include_functions: ['Hello'], exclude_functions:[] },
]

describe('serverless package', function () {
  before(function () {
    this.timeout(60000);
    this.plugin_path = runCommand('npm',['link'])
    const homedir = require('os').homedir();
    this.test_path = path.join(homedir,'.serverless-test')
    fs.removeSync(this.test_path)
    fs.copySync('examples',this.test_path)
  })

  test_data.forEach(({folder, gem_zip_dirs,function_files, include_functions, exclude_functions, check_version }) => {
    it (`should bundle gem and configure layer for ${folder} example`, function() { 
      this.timeout(240000);
      let context_path = path.join(this.test_path, folder)
      let env = process.env
      if (!['use-docker','basic'].includes(folder)) {
        env.SLS_DEBUG = '*'
      }
      options= {cwd: context_path, encoding : 'utf8',env: env }
      runCommand('npm',['link','serverless-ruby-layer'],options)
      runCommand('serverless',['package'],options)
      let dot_serverless_path = path.join(context_path,'.serverless')
      let layer_zip_path = path.join(dot_serverless_path,'ruby_layer','gemLayer.zip')
      let function_zip_path = path.join(dot_serverless_path,`${folder}.zip`)
      value = readZip(function_zip_path)
        .then(function(data){
          assert.deepEqual(function_files,data)
        })
      run_time = folder.endsWith('pg-old')? '2.7': '3.2'
      value = readZip(layer_zip_path)
        .then(function(data){
          if (!check_version) {
            data = data.map(data => data.replace(/-\d.*\d/g, ''))
          }
          assert.deepEqual(gem_zip_dirs.map(data => data.startsWith('lib')? data : 'ruby/'+run_time+'.0'+data).concat(['ruby/']).sort(),data.sort())
        })
      let serverless_config = JSON.parse(fs.readFileSync(path.join(dot_serverless_path,'serverless-state.json')));
      assert.deepEqual(serverless_config['service']['layers']['gem']['package']['artifact'], path.resolve(layer_zip_path))
      cloud_resource = serverless_config['service']['provider']['compiledCloudFormationTemplate']['Resources']
      const {Content, ...others} = cloud_resource['GemLambdaLayer']['Properties']
      assert.deepEqual(others,{CompatibleRuntimes: ['ruby'+run_time],
        Description: 'Ruby gem generated by serverless-ruby-bundler',
        LayerName: `${folder}-dev-ruby-bundle`
      })
      include_functions.forEach((name) => {
        func_properties = cloud_resource[`${name}LambdaFunction`]['Properties']
        assert.deepEqual(func_properties['Layers'],[ { Ref: 'GemLambdaLayer' } ])
        assert.deepEqual(func_properties['Environment'],
          {Variables: { GEM_PATH: '/opt/ruby/'+run_time+'.0'}})
      })

      exclude_functions.forEach((name) => {
        console.log(name)
        func_properties = cloud_resource[`${name}LambdaFunction`]['Properties']
        assert.equal(func_properties['Layers'],undefined)
        assert.equal(func_properties['Environment'],undefined)
      })
  });
});
});
