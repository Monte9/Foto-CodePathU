//
//  CreateNewStreamController.swift
//  ParseSetup
//
//  Created by Monte's Pro 13" on 4/21/16.
//  Copyright © 2016 MonteThakkar. All rights reserved.
//

import UIKit

protocol CreateNewStreamControllerDelegate
{
    func sendValue(var value : NSString)
}

class CreateNewStreamController: UIViewController {

    @IBOutlet weak var streamName: UITextField!
    
    var delegate: CreateNewStreamControllerDelegate?
    
    @IBAction func dismissViewController(sender: AnyObject) {
        self.dismissViewControllerAnimated(true, completion: nil)
    }
    
    @IBAction func onCreateStream(sender: AnyObject) {
        delegate?.sendValue(streamName.text!)
        self.dismissViewControllerAnimated(true, completion: nil)
    }
    
}
