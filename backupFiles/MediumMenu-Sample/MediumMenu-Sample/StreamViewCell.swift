//
//  StreamViewCell.swift
//  iStream
//
//  Created by Veronika Kotckovich on 3/3/16.
//  Copyright © 2016 pixyzehn. All rights reserved.
//

import UIKit

class StreamViewCell: UITableViewCell, UITextViewDelegate, UITextFieldDelegate {

    @IBOutlet weak var newSteramTextField: UITextField!
    
    @IBOutlet weak var captionTextView: UITextView!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
        captionTextView.delegate = self
        newSteramTextField.delegate = self
        captionTextView.text = "Caption"
        captionTextView.textColor = UIColor(white: 1, alpha: 0.7)
        newSteramTextField.attributedPlaceholder = NSAttributedString(string:" New Stream",
            attributes:[NSForegroundColorAttributeName: UIColor(white: 1, alpha: 0.7)])
    }
    
    
    func textViewDidBeginEditing(textView: UITextView) {
        if captionTextView.textColor == UIColor(white: 1, alpha: 0.7) {
            captionTextView.text = nil
            captionTextView.textColor = UIColor(white: 1, alpha: 1)
            print("i am in begin")
        }
    }
    
    func textViewDidEndEditing(textView: UITextView) {
        if captionTextView.text.isEmpty {
            captionTextView.text = "Caption"
            captionTextView.textColor = UIColor(white: 1, alpha: 0.7)
        }
    }
    
    @IBAction func onEditingNewStream(sender: AnyObject) {
        
    }
    override func setSelected(selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)
        
        // Configure the view for the selected state
    }
    
    
    func textFieldShouldReturn(textField: UITextField) -> Bool {   //delegate method
        newSteramTextField.resignFirstResponder()
        return true
    }
    
    func textView(textView: UITextView, shouldChangeTextInRange range: NSRange, replacementText text: String) -> Bool {
        if(text == "\n") {
            textView.resignFirstResponder()
            return false
        }
        return true
    }
}
