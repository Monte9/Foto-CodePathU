//
//  MediumMenuItem.swift
//
//  Created by Jasmine Farrell on 2/18/16.
//  Copyright © 2016 JIFarrell. All rights reserved.
//

import UIKit

public class MediumMenuItem {
    public var title: String?
    public var completion: completionHandler?

    init() {}
    
    public convenience init(title: String, completion: completionHandler) {
        self.init()
        self.title = title
        self.completion = completion
    }
}
