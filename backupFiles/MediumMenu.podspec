Pod::Spec.new do |s|
  s.name = "MediumMenu"
  s.version = "1.1.2"
  s.summary = "menu based on Medium iOS app"
  s.homepage = 'https://github.com/pixyzehn/MediumMenu'
  s.license = { :type => 'MIT', :file => 'LICENSE' }
  s.author = { "pixyzehn" => "civokjots0109@gmail.com" }

  s.requires_arc = true
  s.ios.deployment_target = "8.0"
  s.source = { :git => "https://github.com/pixyzehn/MediumMenu.git", :tag => "#{s.version}" }
  s.source_files = "MediumMenu/*.swift"
end
